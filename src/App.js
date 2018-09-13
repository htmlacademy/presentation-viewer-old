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
    mainPage: true,
    fullScreenMode: false,
    needFullScreen: false,
    fullScreenWidth: null,
    containerWidth: null,
    secondWindowSlideWidth: 350,
    currentPage: 1,
    preloadPages: 5,
    pages: [],
    miniPages: [],
  };

  componentDidMount() {
    const mainPage = window.name !== 'secondWindow';
    const fullScreenWidth = window.screen.width;

    if (mainPage) {
      window.addEventListener('keydown', this.onKeyDown);

    }
    if (!mainPage) {
      window.addEventListener('message', this.onReceiveMessage);
    }

    this.setState({ mainPage, fullScreenWidth });
  };

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('message', this.onReceiveMessage);
  }

  onReceiveMessage = (evt) => {
    const { secondWindowSlideWidth } = this.state;

    if (!!evt.data.file) {
      this.setState({ file: evt.data.file })
    }
    if (!!evt.data.currentPage) {
      this.setState({ currentPage: evt.data.currentPage })
    }
    if (evt.data === 'nextSlide') {
      this.showNextSlide(secondWindowSlideWidth);
    }
    if (evt.data === 'prevSlide') {
      this.showPrevSlide(secondWindowSlideWidth);
    }
  };

  onDocumentLoad = ({ numPages }) => {
    const { mainPage, containerWidth, secondWindowSlideWidth } = this.state;
    const miniPages = [];

    if (mainPage) {
      for (let i = 1; i <= numPages; i++) {
        miniPages.push(this.renderPage(i, 220, 'mini-page'));
      }
    }

    const width = mainPage ? containerWidth : secondWindowSlideWidth;
    const pages = this.preloadSlides(width, numPages);
    this.setState({ numPages, miniPages, pages });
  };

  onInputChange = (evt) => {
    const file = evt.target.files[0];
    this.setState({ file });
    if (this.state.secondWindow) {
      this.state.secondWindow.postMessage({ file }, '*');
    }
  };

  onFullScreenBtnClick = () => {
    const needFullScreen = true;
    const pages = this.preloadSlides(this.state.fullScreenWidth);

    this.setState({ needFullScreen, pages });
  };

  onFullScreenExit = () => {
    const fullScreenMode = false;
    const pages = this.preloadSlides(this.state.containerWidth);
    this.setState({ fullScreenMode, pages });
  };

  onFullScreenEnter = () => {
    const fullScreenMode = true;
    const needFullScreen = false;
    const pages = this.preloadSlides(this.state.fullScreenWidth);
    this.setState({ fullScreenMode, needFullScreen, pages })
  };

  onNewWindowOpen = () => {
    const { file, currentPage } = this.state;
    const secondWindow = window.open('.', 'secondWindow');

    if (file) {
      setTimeout(() => {
        secondWindow.postMessage({ file }, '*');
        secondWindow.postMessage({ currentPage }, '*');
      }, 3000);
    }

    this.setState({ secondWindow });
  };

  onKeyDown = (evt) => {
    const { mainPage, containerWidth, fullScreenWidth, fullScreenMode } = this.state;

    if (evt.key === 'ArrowRight' && mainPage) {
      const width = fullScreenMode ? fullScreenWidth : containerWidth;
      this.showNextSlide(width);
    }

    if (evt.key === 'ArrowLeft') {
      const width = fullScreenMode ? fullScreenWidth : containerWidth;
      this.showPrevSlide(width);
    }

    if (evt.key === 'n' || evt.key === 'т') {
      this.onNewWindowOpen();
    }

    if (evt.key === 'm'|| evt.key === 'ь') {
      const { secondWindow, file, currentPage } = this.state;

      if (secondWindow && file) {
        secondWindow.postMessage({ file }, '*');
        secondWindow.postMessage({ currentPage }, '*');
      }
    }

  };

  showNextSlide(width) {
    let { pages, currentPage, numPages, preloadPages, secondWindow, mainPage } = this.state;
    const className = mainPage ? 'main-slide' : 'second-page-slides';

    if (currentPage >= numPages) {
      return null;
    }

    const nextPreloadSlide = preloadPages + currentPage;
    currentPage += 1;
    pages.shift();

    if (nextPreloadSlide <= numPages) {
      pages.push(this.renderPage(nextPreloadSlide, width, className));
    }

    if (secondWindow && mainPage) {
      secondWindow.postMessage('nextSlide', '*');
    }

    this.setState({ currentPage, pages })
  }

  showPrevSlide(width) {
    let { pages, currentPage, numPages, secondWindow, mainPage, preloadPages } = this.state;
    const className = mainPage ? 'main-slide' : 'second-page-slides';

    if (currentPage <= 1) {
      return null;
    }

    currentPage -= 1;
    const pagesLeft = numPages - currentPage;

    if (pagesLeft < preloadPages) {
      pages.unshift(this.renderPage(currentPage, width, className));
    } else {
      pages.pop();
      pages.unshift(this.renderPage(currentPage, width, className));
    }

    if (secondWindow && mainPage) {
      secondWindow.postMessage('prevSlide', '*');
    }

    this.setState({ currentPage, pages });
  }

  preloadSlides = (width, numPages = this.state.numPages) => {
    const { preloadPages, currentPage, mainPage } = this.state;
    const pages = [];
    const pageLeft = numPages - currentPage;
    const numIterate = pageLeft < preloadPages ? pageLeft + 1: preloadPages;
    const className = mainPage ? 'main-slide' : 'second-page-slides';

    for (let i = 0; i < numIterate; i++) {
      pages.push(this.renderPage(i + currentPage, width, className));
    }

    return pages;
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

  setContainerWidth = (containerWidth) => {
    this.setState({ containerWidth });
  };

  render() {
    const { file, mainPage, pages, miniPages, needFullScreen, numPages, currentPage, secondWindow } = this.state;

    const mainWindow = (
      <section>
        <Header numPages={numPages}
                currentPage={currentPage}
                file={file}
                secondWindow={secondWindow}
                onInputChange={this.onInputChange}
                onFullScreenBtnClick={this.onFullScreenBtnClick}
                onNewWindowOpen={this.onNewWindowOpen}
        />
        <div className="main-wrap">
          <Sidebar file={file}
                   miniPages={miniPages}
          />
          <MainSlide file={file}
                     pages={pages}
                     needFullScreen={needFullScreen}
                     setContainerWidth={this.setContainerWidth}
                     onFullScreenEnter={this.onFullScreenEnter}
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
        <div className="second-window">{this.state.pages}</div>
      </Document>
    );

    return mainPage ? mainWindow : duplicateWindow;
  }
}

export default App;
