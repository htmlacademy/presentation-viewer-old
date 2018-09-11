import React, {Component} from 'react';
import './main-slide.css';
import {Document} from "react-pdf/dist/entry.webpack";

class MainSlide extends Component {
  componentDidMount() {
    this.props.setSize(this.pdfWrapper);
    document.addEventListener('webkitfullscreenchange', this.onChangeFullScreen, false);
  }

  componentWillUnmount() {
    document.removeEventListener('webkitfullscreenchange', this.onChangeFullScreen);
  }

  componentDidUpdate() {
    if (this.props.fullScreenMode) {
      this.pdfWrapper.webkitRequestFullscreen();
    }
  }
  // todo fix black screen when go on 5+ full screen
  onChangeFullScreen = () => {
    if (!document.webkitIsFullScreen) {
      this.props.onFullScreenExit();
      this.props.setSize(this.pdfWrapper);
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
