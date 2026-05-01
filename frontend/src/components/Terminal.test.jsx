import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Terminal from './Terminal';
import { socket } from '../socket';

// Mock the socket instance
vi.mock('../socket', () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}));



describe('Terminal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders terminal with banner', () => {
    render(<Terminal theme="dark" />);
    // Check if the banner or "MiniShell" text is present
    expect(screen.getByText(/MiniShell/)).toBeInTheDocument();
  });

  test('handles input change', () => {
    render(<Terminal theme="dark" />);
    const input = screen.getByPlaceholderText(/Type a command/);
    fireEvent.change(input, { target: { value: 'ls' } });
    expect(input.value).toBe('ls');
  });

  test('submits command on Enter', async () => {
    render(<Terminal theme="dark" />);
    const input = screen.getByPlaceholderText(/Type a command/);
    fireEvent.change(input, { target: { value: 'pwd' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(socket.emit).toHaveBeenCalledWith('command', { command: 'pwd', args: [] });
  });

  test('submits command on Run button click', () => {
    render(<Terminal theme="dark" />);
    const input = screen.getByPlaceholderText(/Type a command/);
    fireEvent.change(input, { target: { value: 'mkdir test' } });
    
    const runButton = screen.getByText(/Run/i);
    fireEvent.click(runButton);

    expect(socket.emit).toHaveBeenCalledWith('command', { command: 'mkdir', args: ['test'] });
  });

  test('clears terminal on clear command', () => {
    render(<Terminal theme="dark" />);
    const input = screen.getByPlaceholderText(/Type a command/);
    
    // First, let's assume there's some history (the banner)
    expect(screen.getByText(/MiniShell/)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'clear' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // After clear, the banner should be gone
    expect(screen.queryByText(/MiniShell/)).not.toBeInTheDocument();
  });

  test('shows loading state when command is running', async () => {
    render(<Terminal theme="dark" />);
    const input = screen.getByPlaceholderText(/Type a command/);
    fireEvent.change(input, { target: { value: 'ls' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/Running/i)).toBeInTheDocument();
  });

  test('displays output from socket', async () => {
    render(<Terminal theme="dark" />);
    
    // Find the callback registered with socket.on('output', ...)
    const onOutput = socket.on.mock.calls.find(call => call[0] === 'output')[1];
    
    // Simulate receiving output
    onOutput({ output: 'hello from backend' });

    await waitFor(() => {
      // Use textContent to match across multiple spans
      expect(screen.getByText((content, element) => {
        return element.textContent === 'hello from backend';
      })).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
