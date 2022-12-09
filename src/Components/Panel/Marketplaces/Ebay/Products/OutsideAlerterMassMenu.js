import React, { Component } from "react";
import PropTypes from "prop-types";

/**
 * Component that alerts if you click outside of it
 */
export default class OutsideAlerterMassMenu extends Component {
  constructor(props) {
    super(props);
    // let {popoverActive, setPopoverActive} = props
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  /**
   * Set the wrapper ref
   */
  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  /**
   * Alert if clicked on outside of element
   */
  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      // alert("You clicked outside of me!");
      console.log(document.getElementsByClassName('massMenu')[0].className);
      let classNameExtracted = document.getElementsByClassName('massMenu')[0].className
      if (classNameExtracted.includes("massMenu"))
        this.props.setIsOpen(true);
      else this.props.setIsOpen(false);
    }
  }

  render() {
    return <div ref={this.setWrapperRef}>{this.props.children}</div>;
  }
}
