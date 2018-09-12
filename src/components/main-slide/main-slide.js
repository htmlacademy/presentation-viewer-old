import React, {Component} from 'react';
import './main-slide.css';
import {Document} from "react-pdf/dist/entry.webpack";

class MainSlide extends Component {
  componentDidMount() {
    this.props.setContainerWidth(this.pdfWrapper.getBoundingClientRect().width);
    document.addEventListener('webkitfullscreenchange', this.onExitFullScreen, false);
  }

  componentWillUnmount() {
    document.removeEventListener('webkitfullscreenchange', this.onExitFullScreen);
  }

  componentDidUpdate() {
    if (this.props.needFullScreen) {
      this.props.onFullScreenEnter();
      this.pdfWrapper.webkitRequestFullscreen();
    }
  }

  onExitFullScreen = () => {
    if (!document.webkitIsFullScreen) {
      this.props.onFullScreenExit();
    }
  };

  render() {
    return (
      <section className="main-slide__wrap">
        {this.props.file ? null : <h2 className="main-slide__title">Загрузите, пожалуйста, презентацию</h2>}

        <div className="main-slides-inner" ref={(ref) => this.pdfWrapper = ref}>
          <Document file={this.props.file}
                    className="main-slides-container"
                    noData=""
          >
            {this.props.pages}
          </Document>
        </div>
      </section>
    );
  }
}

export default MainSlide;
