import React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import remove from '../images/remove.svg';

class ImageModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: props.isOpen || false
    };
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  }

  render() {
    return (
      <div>
        <Button onClick={this.toggle} className="modal-close"><img src={remove} alt="close modal"/></Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalBody>
            {this.props.body}
          </ModalBody>
          <ModalFooter>
            <div className="title">{this.props.title}</div>
            <div className="description">{this.props.description}</div>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default ImageModal;