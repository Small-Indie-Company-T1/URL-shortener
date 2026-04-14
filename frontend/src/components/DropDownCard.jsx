import React from 'react';

const DropDownCard = ({ data }) => {
  return (
    <div>
      <ul>
        {data.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default DropDownCard;
