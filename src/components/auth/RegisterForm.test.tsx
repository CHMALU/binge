import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';
import RegisterForm from '@/components/auth/RegisterForm';
import type { AuthDict } from '@/components/auth/LoginForm';

jest.mock('next-auth/react', () => ({ signIn: jest.fn() }));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
}));

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

const dict: AuthDict = {
  login: 'Sign in', register: 'Sign up', email: 'Email', password: 'Password',
  confirmPassword: 'Confirm password', name: 'Name',
  loginButton: 'Login', registerButton: 'Register',
  orContinueWith: 'or continue with', google: 'Google',
  noAccount: 'No account?', haveAccount: 'Have account?',
  loginLink: 'Login', registerLink: 'Register',
  tagline: 'tagline', loginSuccess: 'Welcome', registerSuccess: 'Registered',
  errorInvalidCredentials: 'Invalid credentials', errorEmailInUse: 'Email in use',
  errorGeneric: 'Something went wrong',
  errorPasswordMismatch: 'Passwords differ', errorPasswordShort: 'Too short',
};

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders name, email, password, confirm and register button', () => {
    render(<RegisterForm lang="en" t={dict} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('shows error and does not call API when passwords mismatch', async () => {
    render(<RegisterForm lang="en" t={dict} />);
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret123');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'different1');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(toast.error).toHaveBeenCalledWith('Passwords differ');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows error and does not call API when password is shorter than 6', async () => {
    render(<RegisterForm lang="en" t={dict} />);
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Password'), '123');
    await userEvent.type(screen.getByLabelText('Confirm password'), '123');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(toast.error).toHaveBeenCalledWith('Too short');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('POSTs to /api/auth/register on submit with valid data', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200 });
    render(<RegisterForm lang="en" t={dict} />);

    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret123');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('shows email-in-use toast when API returns 409', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 409 });
    render(<RegisterForm lang="en" t={dict} />);

    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret123');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(toast.error).toHaveBeenCalledWith('Email in use');
  });
});
