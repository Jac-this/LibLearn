const accountsKey = "liblearn-accounts";
const sessionKey = "liblearn-session";

function readAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(accountsKey) || "[]");
    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
}

export function createAccount({ fullName, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = readAccounts();

  if (accounts.some((account) => account.email === normalizedEmail)) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const account = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
  };

  localStorage.setItem(accountsKey, JSON.stringify([...accounts, account]));
  return { ok: true, account };
}

export function signIn(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const account = readAccounts().find(
    (storedAccount) => storedAccount.email === normalizedEmail && storedAccount.password === password,
  );

  if (!account) {
    return { ok: false, error: "Incorrect email or password." };
  }

  const session = {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
  };
  localStorage.setItem(sessionKey, JSON.stringify(session));
  return { ok: true, session };
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(sessionKey) || "null");
  } catch {
    return null;
  }
}

export function signOut() {
  localStorage.removeItem(sessionKey);
}
