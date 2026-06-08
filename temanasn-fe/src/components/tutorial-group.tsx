import { Dialog } from 'tdesign-react';
import CKeditor from './ckeditor';

export default function TutorialGroup({ setVisible, detail, title }: any) {
  const handleClose = () => {
    setVisible(false);
  };
  return (
    <Dialog header={title} visible onClose={handleClose} footer={null}>
      <CKeditor readOnly content={detail} />
    </Dialog>
  );
}
