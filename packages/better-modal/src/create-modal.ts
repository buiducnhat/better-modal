import { registerModal, useModalStore } from "./store";
import type { useModal } from "./use-modal";

export const createModal = <T>(
	id: string,
	Comp: React.FC<T & { modal: ReturnType<typeof useModal> }>,
) => {
	registerModal(id, Comp);
	return {
		id,
		show: (props?: T) => useModalStore.getState().open(id, props),
		hide: () => useModalStore.getState().hide(id),
	};
};
