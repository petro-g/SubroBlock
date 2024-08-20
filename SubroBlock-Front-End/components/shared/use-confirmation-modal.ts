"use client";
import * as React from "react";

type ConfirmationModal = {
  isOpen: boolean;
  // TODO add option to pass custom component as title
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const actionTypes = {
  OPEN_MODAL: "OPEN_MODAL",
  CLOSE_MODAL: "CLOSE_MODAL"
} as const;

type Action =
  | {
  type: typeof actionTypes.OPEN_MODAL
  modal: ConfirmationModal
}
  | {
  type: typeof actionTypes.CLOSE_MODAL
}

interface State {
  modal: ConfirmationModal
}

const initialState: State = {
  modal: {
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    onCancel: () => {}
  }
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "OPEN_MODAL":
      return {
        ...state,
        modal: action.modal
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        modal: {
          // keep title and description so when closed - no flickering
          ...state.modal,
          isOpen: false
        }
      };
    default:
      return state;
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = initialState;

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function openModal(modal: Omit<ConfirmationModal, "isOpen">) {
  dispatch({
    type: "OPEN_MODAL",
    modal: {
      isOpen: true,
      ...modal
    }
  });
}

function closeModal() {
  dispatch({ type: "CLOSE_MODAL" });
}

function useConfirmationModal() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    openModal,
    closeModal
  };
}

export { useConfirmationModal, openModal, closeModal };
