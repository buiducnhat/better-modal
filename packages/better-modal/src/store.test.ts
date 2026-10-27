import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createModal } from "./create-modal";
import { modalRegistry, useModalStore } from "./store";

const resetState = () => {
  useModalStore.setState({ modals: {} });
  modalRegistry.clear();
};

beforeEach(resetState);

describe("useModalStore.open", () => {
  it("stores an open entry with the given props and returns a pending promise", async () => {
    const promise = useModalStore.getState().open("confirm", { title: "Sure?" });

    const entry = useModalStore.getState().modals.confirm;
    expect(entry?.isOpen).toBe(true);
    expect(entry?.props).toEqual({ title: "Sure?" });

    // Settle so the test does not leak a pending promise
    useModalStore.getState().resolve("confirm", undefined);
    await expect(promise).resolves.toBeUndefined();
  });

  it("resolves the promise with the value passed to resolve and hides the modal", async () => {
    const promise = useModalStore.getState().open("confirm");

    useModalStore.getState().resolve("confirm", { ok: true });

    await expect(promise).resolves.toEqual({ ok: true });
    expect(useModalStore.getState().modals.confirm?.isOpen).toBe(false);
  });

  it("rejects the promise with the reason passed to reject and hides the modal", async () => {
    const promise = useModalStore.getState().open("confirm");

    useModalStore.getState().reject("confirm", new Error("cancelled"));

    await expect(promise).rejects.toThrow("cancelled");
    expect(useModalStore.getState().modals.confirm?.isOpen).toBe(false);
  });

  it("rejects the previous promise when the same modal is reopened before resolving", async () => {
    const first = useModalStore.getState().open("confirm");
    const second = useModalStore.getState().open("confirm", { retry: true });

    await expect(first).rejects.toThrow('Modal "confirm" was reopened before resolving');

    useModalStore.getState().resolve("confirm", "second result");
    await expect(second).resolves.toBe("second result");
  });

  it("rejects the pending promise when the modal is removed", async () => {
    const promise = useModalStore.getState().open("confirm");

    useModalStore.getState().remove("confirm");

    await expect(promise).rejects.toThrow('Modal "confirm" was removed before resolving');
    expect(useModalStore.getState().modals.confirm).toBeUndefined();
  });

  it("ignores a second settle on the same resolver and warns in non-production", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const promise = useModalStore.getState().open("confirm");
    const settle = useModalStore.getState().modals.confirm?.resolve;

    settle?.("first");
    settle?.("second");

    await expect(promise).resolves.toBe("first");
    expect(warn).toHaveBeenCalledWith(
      '[better-modal] Modal "confirm" resolve() called more than once — ignoring.',
    );
    warn.mockRestore();
  });

  it("does not flip the outcome when the store resolve action runs again after settling", async () => {
    const promise = useModalStore.getState().open("confirm");

    useModalStore.getState().resolve("confirm", "first");
    useModalStore.getState().reject("confirm", new Error("late"));

    await expect(promise).resolves.toBe("first");
  });
});

describe("useModalStore.hide", () => {
  it("closes the modal and clears the settle callbacks", async () => {
    const promise = useModalStore.getState().open("confirm");
    useModalStore.getState().hide("confirm");

    const entry = useModalStore.getState().modals.confirm;
    expect(entry?.isOpen).toBe(false);
    expect(entry?.resolve).toBeUndefined();
    expect(entry?.reject).toBeUndefined();

    // The promise is abandoned on hide; settle nothing. Guard test cleanup:
    useModalStore.setState({ modals: {} });
    void promise;
  });
});

describe("createModal", () => {
  it("registers the component and show() opens the modal, hide() closes it", async () => {
    const controller = createModal<{ title: string }, string>("confirm", () => null);

    expect(modalRegistry.get("confirm")).toBeDefined();
    expect(controller.id).toBe("confirm");

    const promise = controller.show({ title: "Delete?" });
    expect(useModalStore.getState().modals.confirm?.props).toEqual({
      title: "Delete?",
    });

    controller.hide();
    expect(useModalStore.getState().modals.confirm?.isOpen).toBe(false);

    useModalStore.setState({ modals: {} });
    void promise;
  });
});
