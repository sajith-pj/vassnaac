import { Modal, ModalHeader } from 'reactstrap';

function ModalCom({ toggle, open, size = 'xs', title, children }) {

    return (
        <Modal isOpen={open} toggle={toggle} size={size}>
            <ModalHeader toggle={toggle}>{title}</ModalHeader>
            {children}
        </Modal>
    );
}

export default ModalCom;