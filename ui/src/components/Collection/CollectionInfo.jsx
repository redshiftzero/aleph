import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';
import {Button, Tab, Tabs} from "@blueprintjs/core";

import { fetchCollectionXrefIndex } from 'src/actions';
import { selectCollectionXrefIndex } from 'src/selectors';
import {Toolbar, CloseButton} from 'src/components/Toolbar';
import CollectionEditDialog from 'src/dialogs/CollectionEditDialog/CollectionEditDialog';
import AccessCollectionDialog from 'src/dialogs/AccessCollectionDialog/AccessCollectionDialog';
import {DualPane, TabCount} from 'src/components/common';
import {CollectionInfoXref, CollectionOverview, CollectionInfoContent} from 'src/components/Collection';

class CollectionInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTabId: 'overview',
      settingsIsOpen: false,
      accessIsOpen: false
    };

    this.handleTabChange = this.handleTabChange.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.toggleAccess = this.toggleAccess.bind(this);
  }
  
  componentDidMount() {
    const { collection, xrefIndex } = this.props;
    if (collection.id !== undefined && xrefIndex.results === undefined && !xrefIndex.isLoading) {
      this.props.fetchCollectionXrefIndex(collection);
    }
  }

  componentDidUpdate(prevProps) {
    const { collection, xrefIndex } = this.props;
    if (collection.id !== undefined && xrefIndex.results === undefined && !xrefIndex.isLoading) {
      this.props.fetchCollectionXrefIndex(collection);
    }
  }

  handleTabChange(activeTabId: TabId) {
    this.setState({activeTabId});
  }

  toggleSettings() {
    this.setState({ settingsIsOpen: !this.state.settingsIsOpen });
  }

  toggleAccess() {
    this.setState({ accessIsOpen: !this.state.accessIsOpen });
  }

  render() {
    const {collection, showToolbar, xrefIndex} = this.props;
    const {activeTabId, settingsIsOpen, accessIsOpen} = this.state;
    const hasXref = xrefIndex.results !== undefined && xrefIndex.results.length > 0;

    // @TODO Discussion: 'Search Collection' link to update the current query?
    return (
      <DualPane.InfoPane className="CollectionInfo with-heading">
        {showToolbar && (
          <Toolbar className="toolbar-preview">
            <Link to={`/search?filter:collection_id=${collection.id}`} className="pt-button button-link">
              <span className={`pt-icon-search`}/>
              <FormattedMessage id="collection.info.explore_button" defaultMessage="Explore"/>
            </Link>
            {collection.writeable &&
            <React.Fragment>
              <Button icon="cog" onClick={this.toggleCollectionEdit}>
                <FormattedMessage id="collection.info.edit_button" defaultMessage="Settings"/>
              </Button>
              <CollectionEditDialog
                collection={collection}
                isOpen={settingsIsOpen}
                toggleDialog={this.toggleSettings}
              />
              <Button icon="key" onClick={this.toggleAccess} className='button-hover'>
                <FormattedMessage id="collection.info.access" defaultMessage="Access"/>
              </Button>
              <AccessCollectionDialog
                collection={collection}
                isOpen={accessIsOpen}
                toggleDialog={this.toggleAccess}
              />
            </React.Fragment>}
            <CloseButton/>
          </Toolbar>
        )}
        <div className="pane-heading">
          <span>
            <FormattedMessage id="collection.info.heading" defaultMessage="Source"/>
          </span>
          <h1>
            {collection.label}
          </h1>
        </div>
        <div className="pane-content">
          <Tabs id="CollectionInfoTabs" onChange={this.handleTabChange} selectedTabId={activeTabId}>
            <Tab id="overview"
                 title={
                   <React.Fragment>
                     <FormattedMessage id="collection.info.overview" defaultMessage="Overview"/>
                   </React.Fragment>
                 }
                 panel={<React.Fragment>
                   <CollectionOverview collection={collection} hasHeader={false}/>
                 </React.Fragment>
                 }
            />
            <Tab id="content"
                 title={
                   <React.Fragment>
                     <FormattedMessage id="collection.info.contents" defaultMessage="Contents"/>
                   </React.Fragment>
                 }
                 panel={<CollectionInfoContent collection={collection} schemata={collection.schemata}/>}
            />
            {hasXref && <Tab id="xref"
                 disabled={!hasXref}
                 title={
                   <React.Fragment>
                     <FormattedMessage id="collection.info.source" defaultMessage="Cross-reference"/>
                     <TabCount count={xrefIndex.total} />
                  </React.Fragment>
                 }
                 panel={<CollectionInfoXref xrefIndex={xrefIndex} collection={collection} />}
            />}

          </Tabs>
        </div>
      </DualPane.InfoPane>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    xrefIndex: selectCollectionXrefIndex(state, ownProps.collection.id)
  }
};

export default connect(mapStateToProps, { fetchCollectionXrefIndex })(CollectionInfo);
