import Button from '@/components/button';
import Form from '@/components/form';
import Input from '@/components/input';
import { postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import LOGO from '@/assets/Logo.png';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    FetchAPI(postData('auth/forgot-password', data))
      .then(() => {
        navigate('/auth/login');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <div className="min-h-[100vh] bg-gray-50 pt-20">
        <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              className="mx-auto h-10 w-auto"
              src={LOGO}
              alt="Your Company"
            />
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Lupa Kata Sandi
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

                <Button type="submit" isLoading={isLoading}>
                  Kirim
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
