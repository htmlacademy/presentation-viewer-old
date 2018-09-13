import React, {PureComponent} from 'react';
import './header.css';

class Header extends PureComponent {
  render() {
    const {file, numPages, onFullScreenBtnClick, currentPage, secondWindow} = this.props;

    return (
      <header className="header">
        <div className="header__inner">
          <input className="pdf-loader-input" id="pdf-loader-input" type="file" onChange={this.props.onInputChange} />
          <label htmlFor="pdf-loader-input" className=" button pdf-loader">Загрузить pdf</label>
          <button className="button new-window" type="button" onClick={this.props.onNewWindowOpen}>Открыть новую вкладку</button>
          <button className="button sync-pages" disabled={!secondWindow} type="button" onClick={this.props.onSyncFiles}>Синхронизировать вкладки</button>
          <button className="button prev-slide" disabled={!file} type="button">Предыдущий слайд</button>
          <button className="button next-slide" disabled={!file} type="button">Следующий слайд</button>
          <div className="current-slide-wrap">
            <input type="text" className="current-slide" disabled={!file} value={file ? currentPage: 0}/>
            / <span className="page-count">{numPages ? numPages : 0}</span>
          </div>
          <button className="button full-screen" type="button" disabled={!file} onClick={onFullScreenBtnClick}>Full screen</button>
        </div>
      </header>
    );
  }
}

export default Header;
