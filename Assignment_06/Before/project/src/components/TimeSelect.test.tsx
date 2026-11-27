// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import TimeSelect from "@/components/TimeSelect";

afterEach(cleanup);

function typeAndBlur(text: string) {
  const input = screen.getByLabelText(/Start time/);
  fireEvent.change(input, { target: { value: text } });
  fireEvent.blur(input);
}

function StatefulTimeSelect({ initial }: { initial: number | "" }) {
  const [value, setValue] = useState<number | "">(initial);
  return <TimeSelect label="Start time" value={value} onChange={setValue} />;
}

describe("TimeSelect — time-entry validation", () => {
  it("stores a valid HH:MM value as minutes after midnight", () => {
    const onChange = vi.fn();
    render(<TimeSelect label="Start time" value="" onChange={onChange} now={540} />);
    typeAndBlur("11:30");
    expect(onChange).toHaveBeenLastCalledWith(690);
    expect(screen.queryByText(/Enter a time as HH:MM/)).toBeNull();
  });

  it("accepts 24:00 as the end of the day", () => {
    const onChange = vi.fn();
    render(<TimeSelect label="Start time" value="" onChange={onChange} />);
    typeAndBlur("24:00");
    expect(onChange).toHaveBeenLastCalledWith(1440);
  });

  it("rejects an hour above 24 with the format message and clears the stored value", () => {
    const onChange = vi.fn();
    render(<TimeSelect label="Start time" value="" onChange={onChange} />);
    typeAndBlur("25:00");
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(screen.getByText("Enter a time as HH:MM (00:00–24:00).")).toBeTruthy();
  });

  it("rejects 24:30 because nothing is allowed past 24:00", () => {
    const onChange = vi.fn();
    render(<TimeSelect label="Start time" value="" onChange={onChange} />);
    typeAndBlur("24:30");
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(screen.getByText("Enter a time as HH:MM (00:00–24:00).")).toBeTruthy();
  });

  it("rejects minutes of 60 or more", () => {
    const onChange = vi.fn();
    render(<TimeSelect label="Start time" value="" onChange={onChange} />);
    typeAndBlur("10:60");
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(screen.getByText("Enter a time as HH:MM (00:00–24:00).")).toBeTruthy();
  });

  it("rejects text that is not a time", () => {
    const onChange = vi.fn();
    render(<TimeSelect label="Start time" value="" onChange={onChange} />);
    typeAndBlur("noon");
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(screen.getByText("Enter a time as HH:MM (00:00–24:00).")).toBeTruthy();
  });

  it("rejects a time that is not after the current time", () => {
    const onChange = vi.fn();
    render(<TimeSelect label="Start time" value="" onChange={onChange} now={540} />);
    typeAndBlur("09:00");
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(screen.getByText("Must be after 09:00.")).toBeTruthy();
  });

  it("treats a blank entry as no time without showing an error", () => {
    const onChange = vi.fn();
    render(<TimeSelect label="Start time" value="" onChange={onChange} />);
    typeAndBlur("   ");
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(screen.queryByText(/Enter a time as HH:MM/)).toBeNull();
  });

  it("clears the error once a valid time is entered", () => {
    const onChange = vi.fn();
    render(<TimeSelect label="Start time" value="" onChange={onChange} />);
    typeAndBlur("99:99");
    expect(screen.getByText("Enter a time as HH:MM (00:00–24:00).")).toBeTruthy();
    typeAndBlur("12:00");
    expect(screen.queryByText("Enter a time as HH:MM (00:00–24:00).")).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith(720);
  });

  it("keeps the error visible after a previously set time is rejected", () => {
    render(<StatefulTimeSelect initial={600} />);
    typeAndBlur("25:00");
    expect(screen.getByText("Enter a time as HH:MM (00:00–24:00).")).toBeTruthy();
    expect(screen.getByLabelText(/Start time/)).toHaveProperty("value", "25:00");
  });
});
