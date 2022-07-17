/*
  Author : sahil Gupta
  Github : https://github.com/techhysahil
  FileName : DimensionComponent.js
  Creation Date : 27th June, 2k18
*/

import React from 'react';
import PropTypes from 'prop-types';
import Popover from '@material-ui/core/Popover';
import classnames from 'classnames';

import './itraDropdown.scss';

class ItraDropdown extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showDropdown: false,
      dataSource: props.dataSource,
      liveList: props.dataSource,
      selectedValue: props.selectedValue || null,
      textInputValue: '',
      showSearchBar: props.showSearchBar,
      disableAction: props.disable ? props.disable : false,
      placeholder: props.dontShowSelectedValue ? '' : props.placeholder || 'Select Item',
      dropdownWidth: props.dropdownWidth || null,
      labelWidth: props.labelWidth || null,
    };
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.closeDropdown = this.closeDropdown.bind(this);
    this.itemSelected = this.itemSelected.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataSource: nextProps.dataSource,
      selectedValue: nextProps.selectedValue || null,
      showSearchBar: nextProps.showSearchBar,
      disableAction: nextProps.disable ? nextProps.disable : false,
      placeholder: nextProps.dontShowSelectedValue ? '' : nextProps.placeholder || 'Select Item',
      dropdownWidth: nextProps.dropdownWidth || null,
      labelWidth: nextProps.labelWidth || null,
    });
  }

  searchUpdated(event) {
    const searchStr = event.target.value && event.target.value.toLowerCase();
    var queryResult = [];

    this.props.dataSource.forEach(item => {
      if (item.list && item.list.length > 0) {
        const subList = item.list.filter(subitem => {
          return (
            subitem.name &&
            typeof subitem.name === 'string' &&
            subitem.name.toLowerCase().indexOf(searchStr.toLowerCase()) > -1
          );
        });
        if (subList.length > 0) {
          queryResult.push({
            name: item.name,
            list: subList,
          });
        }
      } else {
        if (
          item.name &&
          typeof item.name === 'string' &&
          item.name.toLowerCase().indexOf(searchStr.toLowerCase()) > -1
        ) {
          queryResult.push(item);
        }
      }
    });

    this.setState({
      liveList: queryResult,
      textInputValue: event.target.value,
    });
  }

  toggleDropdown(event) {
    event.preventDefault();
    const { dataSource } = this.state;

    this.setState({
      showDropdown: true,
      anchorEl: event.currentTarget,
      textInputValue: '',
      liveList: [...dataSource],
    });
  }

  closeDropdown() {
    this.setState({ showDropdown: false });
  }

  itemSelected(e, item) {
    e.stopPropagation();
    this.setState({ selectedValue: item }, this.closeDropdown);
    this.props.onTagSelection(item, e);
  }

  itemEdited(e, item) {
    e.stopPropagation();
    this.closeDropdown();
    this.props.onEditClick(item);
  }

  onRedirectClick(e, item) {
    e.stopPropagation();
    this.closeDropdown();
    this.props.onRedirectClick(item);
  }

  getSelectedItemClassName = item => {
    const { disableSelectedOption } = this.props;
    const { selectedValue } = this.state;

    return disableSelectedOption && selectedValue?.name === item?.name ? 'selectedItem' : '';
  };

  getLevelRankClassName = item => {
    const { hasRank } = this.props;
    const text = hasRank ? 'label_' + item.levelRank : '';

    return text;
  };

  renderDropdown() {
    return this.state.liveList.map((item, index) => {
      return item.list && item.list.length > 0 ? (
        <div className="category-wrapper" key={index}>
          <div className="category-label">{item.name}</div>
          {item.list.map((subitem, index) => {
            return (
              <div
                className={classnames('list-item', this.getSelectedItemClassName(subitem))}
                key={index}
                onClick={e => this.itemSelected(e, { ...subitem, ...{ id: subitem.id, name: subitem.name } })}
              >
                {subitem.name}
              </div>
            );
          })}
        </div>
      ) : item.name ? (
        <div className="list" key={index}>
          {this.props.hasEdit ? (
            <div
              className={
                this.state.selectedValue.name === item.name ? `list-item hasEdit selected` : `list-item hasEdit`
              }
              key={index}
              onClick={e => this.itemSelected(e, { ...item, ...{ id: item.id, name: item.name } })}
            >
              <span>{item.name}</span>
              <i
                onClick={e => {
                  this.itemEdited(e, item);
                }}
                className="icon-edit"
              ></i>
            </div>
          ) : (
            <div title={item.tooltip}>
              <div
                className={classnames(
                  'list-item',
                  this.getSelectedItemClassName(item),
                  this.getLevelRankClassName(item)
                )}
                key={index}
                onClick={e => this.itemSelected(e, { ...item, ...{ id: item.id, name: item.name } })}
              >
                {item.name}
              </div>
            </div>
          )}
        </div>
      ) : null;
    });
  }

  render() {
    let dropdownStyle = {};
    let labelStyle = {};

    if (this.state.dropdownWidth) {
      dropdownStyle = {
        width: this.state.dropdownWidth + 'px',
      };
    }
    if (this.state.labelWidth) {
      labelStyle = {
        width: this.state.labelWidth + 'px',
      };
    }

    return (
      <div
        className={
          'Itra-dropdown-wrapper hover-ui-class ' +
          (this.state.disableAction ? 'disable ' : ' ' + this.props.customClass ? this.props.customClass : '')
        }
        id="Itra-dropdown-wrapper"
        style={labelStyle}
        ref={this.props.innerRef}
      >
        <div className="dropdown-title" onClick={this.toggleDropdown}>
          {this.props.dontShowSelectedValue ? (
            <>
              <span className="value"></span>
              <i className="icon-More" aria-hidden="true" />
            </>
          ) : (
            <>
              <span
                className={this.state.selectedValue ? 'value' : 'placeholder-text'}
                title={this.state.selectedValue?.name}
              >
                {this.state.selectedValue ? this.state.selectedValue.name : this.state.placeholder}
              </span>
              <span className="icons-wrapper">
                {this.props.hasRedirect ? (
                  <i
                    onClick={e => {
                      this.onRedirectClick(e, this.state.selectedValue);
                    }}
                    className="icon-Insights-Active"
                  ></i>
                ) : null}

                {this.props.hasEdit ? (
                  <i
                    onClick={e => {
                      this.itemEdited(e, this.state.selectedValue);
                    }}
                    className="icon-edit"
                  ></i>
                ) : null}

                <i className="icon icon-down-arrow" aria-hidden="true" />
              </span>
            </>
          )}
        </div>

        <Popover
          disableRestoreFocus
          style={{ color: '#3a3f50', fontSize: 12, top: '8px', left: '-12px' }}
          open={this.state.showDropdown}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          onClose={this.closeDropdown}
        >
          <div className={'itra-dropdown-list itra-suggestion-list'}>
            <div className={'input-wrapper' + (this.state.showSearchBar && this.state.showSearchBar ? '' : ' hide')}>
              <input
                autoFocus
                type="text"
                placeholder="Search"
                value={this.state.textInputValue}
                onChange={e => this.searchUpdated(e)}
              />
              <i className="search-icon icon icon_Icon_AnalyticsInterface-33" />
            </div>
            <div className="list-wrapper" style={dropdownStyle}>
              {this.renderDropdown()}
            </div>
          </div>
        </Popover>
      </div>
    );
  }
}

ItraDropdown.propTypes = {
  dataSource: PropTypes.array,
  showSearchBar: PropTypes.bool,
  disable: PropTypes.bool,
  selectedValue: PropTypes.object,
  onTagSelection: PropTypes.func,
  dontShowSelectedValue: PropTypes.bool,
  disableSelectedOption: PropTypes.bool,
};

ItraDropdown.defaultProps = {
  disableSelectedOption: true,
};

export default ItraDropdown;
