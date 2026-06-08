import Button from '@/components/button';
import Form from '@/components/form';
import Input from '@/components/input';
import { useAuthStore } from '@/stores/auth-store';
import { postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import LOGO from '@/assets/Logo.png';

export default function Example() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    FetchAPI(postData('auth/login', data))
      .then((res: any) => {
        login(res.data);
        setTimeout(() => {
          if (res.data.data.user.role === 'ADMIN') {
            return navigate('/dashboard');
          }
          return navigate('/');
        }, 1000);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <div style={{ backgroundImage: `url('/img/bg.jpg')` }} className="min-h-[100vh] bg-no-repeat bg-cover bg-center pt-20">
        <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              className="mx-auto h-10 w-auto"
              src={LOGO}
              alt="Your Company"
            />
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Masuk ke akun Anda
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
            <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
              <Form onSubmit={onSubmit} className="space-y-6">
                <Input
                  title="Email address"
                  name="email"
                  type="email"
                  validation={{
                    required: 'Email tidak boleh kosong',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Format email tidak sesuai',
                    },
                  }}
                />
                <Input
                  type="password"
                  name="password"
                  title="Password"
                  validation={{
                    required: 'Password tidak boleh kosong',
                    minLength: {
                      value: 8,
                      message: 'Password minimal 8 karakter',
                    },
                  }}
                />
                <Link
                  to="/auth/forgot-password"
                  className="!mt-2 text-sm text-right w-full block text-indigo-600 hover:text-indigo-500"
                >
                  Lupa password?
                </Link>
                <Button type="submit" isLoading={isLoading}>
                  Login
                </Button>
              </Form>
            </div>

            <p className="mt-10 text-center text-sm text-gray-500">
              Belum punya akun?{' '}
              <Link
                to="/auth/register"
                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
