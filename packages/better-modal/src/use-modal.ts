import { useCallback, useMemo } from "react";
import { useModalStore } from "./store";
import type { ModalId } from "./types";

export const useModal = (id: ModalId) => {
	// Subscribe only to the specific modal state to avoid unnecessary re-renders
	const modalState = useModalStore((state) => state.modals[id]);

	// Get store actions once (they're stable references from zustand)
	const open = useModalStore((state) => state.open);
	const hideAction = useModalStore((state) => state.hide);
	const removeAction = useModalStore((state) => state.remove);
	const resolveAction = useModalStore((state) => state.resolve);
	const rejectAction = useModalStore((state) => state.reject);

	const show = useCallback((props?: any) => open(id, props), [id, open]);
	const hide = useCallback(() => hideAction(id), [id, hideAction]);
	const remove = useCallback(() => removeAction(id), [id, removeAction]);
	const resolve = useCallback(
		(val: any) => resolveAction(id, val),
		[id, resolveAction],
	);
	const reject = useCallback(
		(err: any) => rejectAction(id, err),
		[id, rejectAction],
	);

	// Memoize the return object to maintain stable reference
	return useMemo(
		() => ({
			visible: !!modalState?.isOpen,
			props: modalState?.props || {},
			show,
			hide,
			remove,
			resolve,
			reject,
		}),
		[
			modalState?.isOpen,
			modalState?.props,
			show,
			hide,
			remove,
			resolve,
			reject,
		],
	);
};
