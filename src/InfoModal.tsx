import { useEffect, useRef, useState } from "react";
import "./styles/modal.scss";

interface Props {
  strings: { [key: string]: string };
  open?: boolean;
  onClose: () => void;
}
export default function InfoModal({ strings, open, onClose }: Props) {
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const [screen2, setScreen2] = useState(false);

  useEffect(() => {
    if (open) {
      console.log(open);
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [open]);

  return (
    <div className="modal-container" data-open={open}>
      <div onClick={() => onClose()} className="modal-backdrop"></div>
      <dialog ref={modalRef}>
        {screen2 ? (
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: strings.info_screen_2 }}
          />
        ) : (
          <>
            <div
              className="content"
              dangerouslySetInnerHTML={{ __html: strings.info_screen_1 }}
            />
            <button onClick={() => setScreen2(true)}>
              {strings.info_next}
            </button>
          </>
        )}
      </dialog>
    </div>
  );
}
