import { useShallow } from "zustand/react/shallow";
import { isDev } from "./dev";
import { modalRegistry, useModalStore } from "./store";
import { useModal } from "./use-modal";

const ModalRenderer = ({ id }: { id: string }) => {
  const modal = useModal(id);
  const Comp = modalRegistry.get(id);

  if (!Comp) {
    if (isDev()) {
      console.warn(
        `[better-modal] No component registered for modal id "${id}". Did you call createModal or registerModal?`,
      );
    }
    return null;
  }

  // oxlint-disable-next-line react/static-components -- Comp is a stable component from the registry, not created during render
  return <Comp {...(modal.props as Record<string, unknown>)} modal={modal} />;
};

export const ModalContainer = () => {
  const activeIds = useModalStore(useShallow((state) => Object.keys(state.modals)));

  return (
    <>
      {activeIds.map((id) => (
        <ModalRenderer id={id} key={id} />
      ))}
    </>
  );
};
