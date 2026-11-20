import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("não renderiza nada quando está fechado", () => {
    render(
      <Modal open={false} title="Título" onClose={() => {}}>
        <p>Conteúdo</p>
      </Modal>
    );
    expect(screen.queryByText("Conteúdo")).not.toBeInTheDocument();
  });

  it("renderiza título e conteúdo quando está aberto", () => {
    render(
      <Modal open={true} title="Registrar tempo?" onClose={() => {}}>
        <p>Conteúdo</p>
      </Modal>
    );
    expect(screen.getByText("Registrar tempo?")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo")).toBeInTheDocument();
  });

  it("expõe o botão de fechar com nome acessível", () => {
    render(
      <Modal open={true} title="Título" onClose={() => {}}>
        <p>Conteúdo</p>
      </Modal>
    );
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument();
  });
});
