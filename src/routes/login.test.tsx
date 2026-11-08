import type { ComponentType } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

const { login, getSession, navigate } = vi.hoisted(() => ({
  login: vi.fn(),
  getSession: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("@/lib/auth.functions", () => ({ login, getSession }));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useNavigate: () => navigate,
}));

import { Route } from "./login";

const LoginPage = Route.options.component as ComponentType;

beforeEach(() => {
  vi.resetAllMocks();
  getSession.mockResolvedValue({ email: "test@example.test" });
});

it("explains a missing session instead of silently returning to login", async () => {
  login.mockResolvedValue({ ok: true });
  getSession.mockResolvedValue(null);
  await submit();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "La session n’a pas pu être ouverte. Autorisez les cookies puis réessayez.",
  );
  expect(navigate).not.toHaveBeenCalled();
});

async function submit() {
  const user = userEvent.setup();
  render(<LoginPage />);
  await user.type(screen.getByLabelText("Email"), "test@example.test");
  await user.type(screen.getByLabelText("Mot de passe"), "test-value");
  await user.click(screen.getByRole("button", { name: "Se connecter" }));
  return user;
}

it("loads the dashboard from the server after a successful login", async () => {
  login.mockResolvedValue({ ok: true });
  await submit();
  await waitFor(() =>
    expect(navigate).toHaveBeenCalledWith({
      to: "/",
      reloadDocument: true,
      replace: true,
    }),
  );
});

it("shows progress and prevents duplicate requests while logging in", async () => {
  login.mockReturnValue(new Promise(() => {}));
  const user = await submit();
  const button = screen.getByRole("button", { name: "Connexion en cours…" });
  expect(button).toBeDisabled();
  await user.click(button);
  expect(login).toHaveBeenCalledTimes(1);
  expect(navigate).not.toHaveBeenCalled();
});

it("shows a rejected login without opening the dashboard", async () => {
  login.mockResolvedValue({ ok: false });
  await submit();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Email ou mot de passe incorrect.",
  );
  expect(screen.getByLabelText("Mot de passe")).toHaveValue("");
  expect(navigate).not.toHaveBeenCalled();
});

it("allows retry after a server failure", async () => {
  login.mockRejectedValueOnce(new Error("Unavailable"));
  const user = await submit();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Connexion impossible pour le moment. Réessayez.",
  );
  login.mockResolvedValueOnce({ ok: true });
  await user.click(screen.getByRole("button", { name: "Se connecter" }));
  await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
});
