import Button from '@/components/button';
import Form from '@/components/form';
import Input from '@/components/input';
import { postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { decodeToken } from 'react-jwt';
import toast from 'react-hot-toast';

interface TokenPayload {
  email: string;
  // Add other properties if necessary
}

import LOGO from '@/assets/Logo.png';

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const { jwt } = useParams();
  const decodedToken = decodeToken<TokenPayload>(jwt || '') || { email: '' };
  const form: TokenPayload = {
    email: decodedToken.email || '',
    // Add other properties if necessary
  };

  useEffect(() => {
    if (form.email === '') {
      navigate('/auth/login');
    }
  }, []);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const data2 = {
      password: data.password,
      token: jwt,
    };
    FetchAPI(postData('auth/reset-password', data2))
      .then(() => {
        navigate('/auth/login');
      })
      .catch(() => {
        toast.error('Waktu token habis, silahkan lakukan reset ulang');
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
              <Form
                onSubmit={onSubmit}
                className="space-y-6"
                defaultValues={form}
              >
                <Input
                  title="Email address"
                  name="email"
                  type="email"
                  readOnly
                />
                <Input
                  type="password"
                  name="password"
                  title="Password Baru"
                  validation={{
                    required: 'Password tidak boleh kosong',
                    minLength: {
                      value: 8,
                      message: 'Password minimal 8 karakter',
                    },
                  }}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
                <Input
                  type="password"
                  name="confirm_password"
                  title="Konfirmasi Password"
                  validation={{
                    required: 'Password tidak boleh kosong',
                    validate: (value: string) => {
                      return value != password ? 'Password tidak sama' : null;
                    },

                    minLength: {
                      value: 8,
                      message: 'Password minimal 8 karakter',
                    },
                  }}
                />

                <Button type="submit" isLoading={isLoading}>
                  Reset
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
