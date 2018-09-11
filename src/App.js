import React, { PureComponent } from 'react';
import { Page } from 'react-pdf';
import { Document } from 'react-pdf/dist/entry.webpack';
import './App.css';
import Header from './components/header/header';
import Sidebar from './components/sidebar/sidebar';
import MainSlide from './components/main-slide/main-slide';


class App extends PureComponent {
  state = {
    file: null,
    numPages: null,
    secondWindow: null,
    width: null,
    mainPage: true,
    fullScreenMode: false,
    secondWindowSlideWidth: 300,
    currentPage: 1,
    preloadPages: 5,
    pages: [],
    miniPages: [],
  };

  componentDidMount() {
    const mainPage = window.name !== 'secondWindow';

    if (mainPage) {
      window.addEventListener('keydown', this.onKeyDown);

    }
    if (!mainPage) {
      window.addEventListener('message', this.onReceiveMessage);
    }

    this.setState({ mainPage });
  };

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('message', this.onReceiveMessage);
  }

  onReceiveMessage = (evt) => {
    // todo check current slide
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
    const { mainPage } = this.state;
    const miniPages = [];

    if (mainPage) {
      for (let i = 1; i <= numPages; i++) {
        miniPages.push(this.renderPage(i, 220, 'mini-page'));
      }
    }

    this.preloadSlides();
    this.setState({ numPages, miniPages });
  };

  onInputChange = (evt) => {
    const file = evt.target.files[0];
    this.setState({ file });
    if (this.state.secondWindow) {
      this.state.secondWindow.postMessage({ file }, '*');
    }
  };

  onFullScreenClick = (evt) => {
    const fullScreenMode = true;
    const width = window.screen.width;
    this.preloadSlides(width);

    this.setState({ width, fullScreenMode });
  };

  onFullScreenExit = () => {
    const fullScreenMode = false;
    this.preloadSlides();
    this.setState({ fullScreenMode });
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
    // todo black screen when go back on last slide
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

  preloadSlides = (width = this.state.width) => {
    const { preloadPages, currentPage } = this.state;
    const pages = [];

    for (let i = currentPage; i <= preloadPages; i++) {
      pages.push(this.renderPage(i, width, 'main-slide'));
    }

    this.setState({ pages });
  };

  renderPage(num, width, className='') {
    return (
      <Page pageNumber={num}
            key={`${className}-number${num}`}
            width={width}
            renderTextLayer={false}
            renderAnnotations={false}
            className={className}
      />
    )
  }

  setSize = (el) => {
    const width = el.getBoundingClientRect().width;
    this.preloadSlides(width);
    this.setState({ width });
  };

  render() {
    const { file, mainPage, pages, miniPages, fullScreenMode, numPages, currentPage, secondWindow } = this.state;

    const mainWindow = (
      <section>
        <Header numPages={numPages}
                currentPage={currentPage}
                file={file}
                secondWindow={secondWindow}
                onInputChange={this.onInputChange}
                onFullScreenClick={this.onFullScreenClick}
        />
        <div className="main-wrap">
          <Sidebar file={file}
                   miniPages={miniPages}
          />
          <MainSlide file={file}
                     pages={pages}
                     setSize={this.setSize}
                     fullScreenMode={fullScreenMode}
                     onFullScreenExit={this.onFullScreenExit}
          />
        </div>
        <Document
          file={file}
          onLoadSuccess={this.onDocumentLoad}
          noData=""
        >
        </Document>
      </section>
    );

    const duplicateWindow = (
      <Document
        file={file}
        onLoadSuccess={this.onDocumentLoad}
      >
        <div>{this.state.pages}</div>
      </Document>
    );

    return mainPage ? mainWindow : duplicateWindow;
  }
}

export default App;
