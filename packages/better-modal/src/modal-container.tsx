import { useShallow } from "zustand/react/shallow";
import { modalRegistry, useModalStore } from "./store";
import { useModal } from "./use-modal";

const ModalRenderer = ({ id }: { id: string }) => {
	const modal = useModal(id);
	const Comp = modalRegistry.get(id);

	if (!Comp) {
		if (process.env.NODE_ENV !== "production") {
			console.warn(
				`[better-modal] No component registered for modal id "${id}". Did you call createModal or registerModal?`,
			);
		}
		return null;
	}

	return <Comp {...(modal.props as Record<string, unknown>)} modal={modal} />;
};

export const ModalContainer = () => {
	const activeIds = useModalStore(
		useShallow((state) => Object.keys(state.modals)),
	);

	return (
		<>
			{activeIds.map((id) => (
				<ModalRenderer id={id} key={id} />
			))}
		</>
	);
};
