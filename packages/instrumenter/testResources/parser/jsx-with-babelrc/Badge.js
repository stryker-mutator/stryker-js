import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  color: PropTypes.string
};

const defaultProps = {
  color: 'secondary',
};

const Badge = (props) => {
  let {
    color,
    ...attributes
  } = props;

  const classes = ['badge', 'badge-' + color];

  if (attributes.href && Tag === 'span') {
    Tag = 'a';
  }

  return (
    <Tag {...attributes} className={classes} />
  );
};

Badge.propTypes = propTypes;
Badge.defaultProps = defaultProps;

export default Badge;
