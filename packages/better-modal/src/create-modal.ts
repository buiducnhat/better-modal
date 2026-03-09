import type React from "react";
import { registerModal, useModalStore } from "./store";
import type { ModalController } from "./types";
import type { useModal } from "./use-modal";

export const createModal = <
	TProps extends Record<string, unknown> = Record<string, unknown>,
	TResult = unknown,
>(
	id: string,
	Comp: React.FC<TProps & { modal: ReturnType<typeof useModal> }>,
): ModalController<TProps, TResult> => {
	registerModal(id, Comp as React.FC<Record<string, unknown>>);
	return {
		id,
		show: (props?: TProps) =>
			useModalStore.getState().open(id, props) as Promise<TResult>,
		hide: () => useModalStore.getState().hide(id),
	};
};
