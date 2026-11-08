import type { ComponentType } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

vi.mock("@/lib/auth.functions", () => ({
  getSession: vi.fn(),
  logout: vi.fn(),
}));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useNavigate: () => vi.fn(),
}));

import { Route } from "./index";

const Home = Route.options.component as ComponentType;

it.each([
  ["IBAN", "FR76 3000 2000 1234 5678 9012 345"],
  ["BIC", "BNPAFRPPXXX"],
  ["BIC", "BNPAFRPP"],
  ["RIB", "30002 00012 12345678901 45"],
  ["RIB", "30002 00012 ABCDE678901 45"],
])(
  "validates %s before showing the test rejection",
  async (type, identifier) => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(
      screen.getByRole("button", { name: "Effectuer un virement" }),
    );
    expect(screen.queryByText("Contacts fréquents")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox"), type);
    await user.type(screen.getByLabelText(type), "123");
    await user.type(screen.getByLabelText(/Montant/), "25,50");
    await user.click(screen.getByRole("button", { name: "Valider" }));
    expect(screen.getByRole("alert")).toHaveTextContent(`${type} invalide`);
    await user.clear(screen.getByLabelText(type));
    await user.type(screen.getByLabelText(type), identifier);
    await user.click(screen.getByRole("button", { name: "Valider" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Le compte n’est pas utilisable.",
    );
    await user.selectOptions(
      screen.getByRole("combobox"),
      type === "IBAN" ? "RIB" : "IBAN",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  },
);
