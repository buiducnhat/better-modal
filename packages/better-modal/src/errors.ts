/** Rejected when a modal is hidden (e.g. backdrop click, ESC) before its `show()` promise settles. */
export class ModalCancelledError extends Error {
  constructor(id: string) {
    super(`Modal "${id}" was hidden before resolving`);
    this.name = "ModalCancelledError";
  }
}
