import React from "react";

interface iProps {
  send: (value: string) => void;
}

// https://stackoverflow.com/a/70362252
const Form = ({ send }: iProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { value: form }: { value: string } = (e.target as any).form;
    send(form);
    e.currentTarget.reset();
  };

  return (
    <div
      className="dependency-input-form"
      style={{
        padding: "16px"
      }}
    >
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="text"
            name="form"
            style={{
              width: "100%",
              height: "28px",
              paddingLeft: "8px",
              paddingRight: "8px",
              lineHeight: "16px",
              border: "1px solid rgb(52, 52, 52)",
              borderRadius: "4px",
              outline: "none",
              backgroundColor: "rgb(52, 52, 52)"
            }}
          />
        </label>
      </form>
    </div>
  );
};

export default Form;
