import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFromFile(filename) {
  const fullPath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(fullPath)) return;

  const raw = fs.readFileSync(fullPath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const idx = trimmed.indexOf("=");
    if (idx === -1) return;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function getArg(name) {
  const key = `--${name}`;
  const idx = process.argv.indexOf(key);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function findUserByEmail(supabase, email) {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;

    const found = data.users.find(
      (user) => String(user.email || "").toLowerCase() === email.toLowerCase()
    );
    if (found) return found;

    if (!data.nextPage) return null;
    page = data.nextPage;
  }
}

async function main() {
  loadEnvFromFile(".env.local");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    fail(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env/.env.local."
    );
  }

  const email = getArg("email") ?? process.env.ADMIN_EMAIL;
  const password = getArg("password") ?? process.env.ADMIN_PASSWORD;
  const nome =
    getArg("name") ??
    process.env.ADMIN_NAME ??
    (email ? email.split("@")[0] : "Administrador");

  if (!email || !password) {
    fail(
      "Usage: node scripts/bootstrap-admin.mjs --email <email> --password <password> [--name <nome>]"
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let user = null;
  let action = "updated";

  const created = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome },
  });

  if (created.error) {
    const msg = created.error.message || "";
    if (!/already|registered|exists/i.test(msg)) {
      throw created.error;
    }
  } else {
    user = created.data.user;
    action = "created";
  }

  if (!user) {
    user = await findUserByEmail(supabase, email);
    if (!user) {
      fail(`User ${email} was not found after create/list flow.`);
    }

    const updated = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(user.user_metadata || {}),
        nome,
      },
    });
    if (updated.error) throw updated.error;
    user = updated.data.user;
  }

  const profileUpsert = await supabase.from("profiles").upsert(
    {
      id: user.id,
      nome,
      role: "admin",
    },
    { onConflict: "id" }
  );
  if (profileUpsert.error) throw profileUpsert.error;

  const profile = await supabase
    .from("profiles")
    .select("id,nome,role")
    .eq("id", user.id)
    .single();
  if (profile.error) throw profile.error;

  console.log(
    JSON.stringify(
      {
        action,
        email: user.email,
        user_id: user.id,
        email_confirmed_at: user.email_confirmed_at,
        profile: profile.data,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Failed to bootstrap admin:", error.message || error);
  process.exit(1);
});
