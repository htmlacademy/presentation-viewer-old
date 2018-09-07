import React, { Component } from 'react';
import { Page } from 'react-pdf';
import { Document } from 'react-pdf/dist/entry.webpack';
import './App.css';


class App extends Component {
  state = {
    file: null,
    numPages: null,
    secondWindow: null,
    mainPage: true,
    width: 1920,
    height: 1080,
    secondWindowSlideWidth: 300,
    currentPage: 1,
    preloadPages: 5,
    pages: [],
  };


  componentWillMount() {
    const mainPage = window.name !== 'secondWindow';
    this.setState({ mainPage });
  }

  componentDidMount() {
    const { mainPage } = this.state;

    if (mainPage) {
      return window.addEventListener('keydown', this.onKeyDown);
    }
    window.addEventListener('message', this.onReceiveMessage);
  };

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('message', this.onReceiveMessage);
  }

  onReceiveMessage = (evt) => {
    if (!!evt.data.file) {
      this.setState({ file: evt.data.file })
    }
    if (evt.data === 'nextSlide') {
      this.showNextSlide();
    }
    if (evt.data === 'prevSlide') {
      this.showPrevSlide();
    }
  };

  onDocumentLoad = ({ numPages }) => {
    const { mainPage, preloadPages, width, secondWindowSlideWidth } = this.state;
    const pages = [];

    if (mainPage) {
      for (let i = 1; i <= preloadPages; i++) {
        pages.push(this.renderPage(i, width));
      }
    } else {
      for (let i = 1; i <= preloadPages; i++) {
        pages.push(this.renderPage(i, secondWindowSlideWidth));
      }
    }

    this.setState({numPages, pages});
  };

  onInputChange = (evt) => {
    const file = evt.target.files[0];
    this.setState({ file });
    if (this.state.secondWindow) {
      this.state.secondWindow.postMessage({ file }, '*');
    }
  };

  onKeyDown = (evt) => {
    if (evt.key === 'ArrowRight') {
      this.showNextSlide();
    }

    if (evt.key === 'ArrowLeft') {
      this.showPrevSlide();
    }

    if (evt.key === 'n' || evt.key === 'т') {
      const secondWindow = window.open('.', 'secondWindow');

      this.setState({ secondWindow });
    }

    if (evt.key === 'm'|| evt.key === 'ь') {
      const { secondWindow, file } = this.state;

      if (secondWindow && file) {
        secondWindow.postMessage({ file }, '*');
      }
    }

  };

  onResolutionChange = (evt) => {
    const width = +evt.target.value;
    const height = width / 16 * 9;
    this.setState({ width, height });
  };

  showNextSlide() {
    let { pages, currentPage, numPages, preloadPages, secondWindow, mainPage, secondWindowSlideWidth, width } = this.state;

    if (currentPage >= numPages) {
      return null;
    }

    const nextPreloadSlide = preloadPages + currentPage;
    currentPage += 1;
    pages.shift();

    if (nextPreloadSlide <= numPages && mainPage) {
      pages.push(this.renderPage(nextPreloadSlide, width));
    }
    if (nextPreloadSlide <= numPages && !mainPage) {
      pages.push(this.renderPage(nextPreloadSlide, secondWindowSlideWidth));
    }

    if (secondWindow && mainPage) {
      secondWindow.postMessage('nextSlide', '*');
    }

    this.setState({ currentPage, pages })
  }

  showPrevSlide() {
    let { pages, currentPage, secondWindow, mainPage, secondWindowSlideWidth, width } = this.state;

    if (currentPage <= 1) {
      return null;
    }

    currentPage -= 1;
    pages.pop();

    if (secondWindow && mainPage) {
      secondWindow.postMessage('prevSlide', '*');
    }

    if (mainPage) {
      pages.unshift(this.renderPage(currentPage, width));
    }

    if (!mainPage) {
      pages.unshift(this.renderPage(currentPage, secondWindowSlideWidth));
    }

    this.setState({ currentPage, pages });
  }

  renderPage(num, width) {
    return (
      <Page pageNumber={num}
            key={`page-number-${num}`}
            width={width}
            renderTextLayer={false}
            renderAnnotations={false}
      />
    )
  }

  render() {
    const { file, width, height, mainPage } = this.state;

    const loadInput = (
      <div className="pagesContainer">
        <div>
          <p>Какой размер у основного экрана?</p>
          <select onChange={this.onResolutionChange}>
            <option value="2560">2560x1440</option>
            <option value="1920" defaultValue>1920x1080</option>
          </select>
        </div>

        <label htmlFor="file">Load from file:</label>&nbsp;
        <input
          type="file"
          onChange={this.onInputChange}
        />

      </div>
    );

    const mainPageStyles = {
      width,
      height,
      overflow: 'hidden',
    };

    const mainDocument = (
      <Document
        file={file}
        onLoadSuccess={this.onDocumentLoad}
      >
        <div style={mainPageStyles}>{this.state.pages}</div>
      </Document>
    );

    const mainWindow = file ? mainDocument : loadInput;

    const secondWindow = (
      <Document
        file={file}
        onLoadSuccess={this.onDocumentLoad}
      >
        <div>{this.state.pages}</div>
      </Document>
    );

    return mainPage ? mainWindow : secondWindow;
  }
}

export default App;
