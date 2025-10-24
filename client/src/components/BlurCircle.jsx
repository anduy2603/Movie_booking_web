import React from 'react';

const BlurCircle = ({
  top = 'auto',
  left = 'auto',
  right = 'auto',
  bottom = 'auto',
  children,
  color = 'bg-red-400/30' // ✅ Cho phép truyền màu từ props
}) => {
  return (
    <div
      className={`absolute -z-50 h-56 w-56 rounded-full blur-3xl ${color}`}
      style={{ top, left, right, bottom }}
    >
      {children}
    </div>
  );
};

export default BlurCircle;
