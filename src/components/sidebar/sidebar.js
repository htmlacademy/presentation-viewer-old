import React, {PureComponent} from 'react';
import './sidebar.css';
import { Document } from 'react-pdf/dist/entry.webpack';

class Sidebar extends PureComponent {
  render() {
    return (
      <section className="sidebar">
        <h2 className="sidebar__title">Страницы</h2>

        <Document className="mini-pages" noData="" file={this.props.file}>
          {this.props.miniPages}
        </Document>
      </section>

    );
  }
}

export default Sidebar;
