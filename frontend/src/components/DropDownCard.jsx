import React from 'react';

const DropDownCard = ({ data, onMouseLeave }) => {
  return (
    <div onMouseLeave={onMouseLeave} className="create-tab__qr-dropdown">
      <ul>
        {data.map((item, i) => (
          <li key={i} className="create-tab__qr-dropdown__element">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DropDownCard;
