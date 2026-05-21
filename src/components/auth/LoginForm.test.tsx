import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import LoginForm, { type AuthDict } from '@/components/auth/LoginForm';

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

describe('LoginForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders email, password, and login button', () => {
    render(<LoginForm lang="en" t={dict} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('calls signIn with entered credentials', async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: null });
    render(<LoginForm lang="en" t={dict} />);

    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'a@b.com',
      password: 'secret123',
      redirect: false,
    });
  });

  it('shows error toast when credentials are invalid', async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: 'CredentialsSignin' });
    render(<LoginForm lang="en" t={dict} />);

    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('links to the register page with locale prefix', () => {
    render(<LoginForm lang="pl" t={dict} />);
    const link = screen.getByRole('link', { name: 'Register' });
    expect(link).toHaveAttribute('href', '/pl/register');
  });
});
