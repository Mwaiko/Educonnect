import { useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: #f0f4f2;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: #f0f4f2;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  overflow: hidden;
  box-shadow: 0 4px 32px rgba(15,110,86,0.10), 0 1px 4px rgba(0,0,0,0.06);
  animation: ${fadeUp} 0.45s cubic-bezier(0.22,1,0.36,1) both;
`;

const Header = styled.div`
  background: #0F6E56;
  padding: 2rem 2rem 1.75rem;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    width: 200px; height: 200px;
    border-radius: 50%;
    border: 32px solid rgba(255,255,255,0.07);
    top: -70px; right: -50px;
  }
  &::after {
    content: '';
    position: absolute;
    width: 110px; height: 110px;
    border-radius: 50%;
    border: 22px solid rgba(255,255,255,0.05);
    bottom: -35px; left: 24px;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 1.25rem;
  position: relative;
  z-index: 1;
`;

const LogoBox = styled.div`
  width: 32px; height: 32px;
  background: rgba(255,255,255,0.18);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
`;

const BrandName = styled.span`
  font-family: 'Fraunces', serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
`;

const HeaderTitle = styled.h1`
  font-family: 'Fraunces', serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.15;
  margin-bottom: 0.4rem;
  position: relative;
  z-index: 1;
`;

const HeaderSub = styled.p`
  font-size: 0.875rem;
  color: rgba(255,255,255,0.72);
  line-height: 1.5;
  position: relative;
  z-index: 1;
`;

const Body = styled.div`
  padding: 1.75rem 2rem 2rem;
`;

const RoleLabel = styled.span`
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 0.5rem;
`;

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 1.25rem;
`;

const RoleTile = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, color 0.18s;
  border: 1.5px solid ${({ $active }) => ($active ? '#0F6E56' : '#e5e7eb')};
  background: ${({ $active }) => ($active ? 'rgba(15,110,86,0.08)' : '#f9fafb')};
  color: ${({ $active }) => ($active ? '#0F6E56' : '#6b7280')};
  &:hover { border-color: #0F6E56; color: #0F6E56; background: rgba(15,110,86,0.05); }
`;

const Field = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 0.4rem;
`;

const InputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

/* The key fix: icon is a styled span with absolute positioning */
const FieldIcon = styled.span`
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: ${({ $focused }) => ($focused ? '#0F6E56' : '#9ca3af')};
  transition: color 0.2s;
  svg {
    width: 17px;
    height: 17px;
    stroke: currentColor;
    fill: none;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const Input = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 42px 0 40px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  background: #f9fafb;
  border: 1.5px solid ${({ $focused }) => ($focused ? '#0F6E56' : '#e5e7eb')};
  border-radius: 10px;
  color: #111827;
  outline: none;
  box-shadow: ${({ $focused }) => ($focused ? '0 0 0 3px rgba(15,110,86,0.12)' : 'none')};
  transition: border-color 0.2s, box-shadow 0.2s;
  &::placeholder { color: #9ca3af; }
`;

const EyeBtn = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: #9ca3af;
  transition: color 0.2s;
  svg { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  &:hover { color: #374151; }
`;

const SignUpBtn = styled.button`
  width: 100%;
  height: 46px;
  background: #0F6E56;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 1.25rem;
  transition: background 0.18s, transform 0.1s;
  svg { width: 18px; height: 18px; stroke: #fff; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  &:hover { background: #085041; }
  &:active { transform: scale(0.98); }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 1.25rem 0;
  font-size: 0.78rem;
  color: #9ca3af;
  &::before, &::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }
`;

const GoogleBtn = styled.button`
  width: 100%;
  height: 44px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: background 0.18s, border-color 0.18s;
  &:hover { background: #fff; border-color: #9ca3af; }
`;

const Footer = styled.p`
  text-align: center;
  font-size: 0.82rem;
  color: #6b7280;
  margin-top: 1.25rem;
  a { color: #0F6E56; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
`;

const Terms = styled.p`
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
  margin-top: 0.85rem;
  line-height: 1.55;
  a { color: #0F6E56; text-decoration: none; &:hover { text-decoration: underline; } }
`;

/* ── Inline SVG icons (render as JSX, sized via FieldIcon wrapper) ── */
const IconUsers = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconBook = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const IconPresentation = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3h20"/>
    <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/>
    <path d="m7 21 5-5 5 5"/>
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const IconRocket = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ── Main component ── */
function SignUpForm() {
  const [role, setRole] = useState('student');
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <>
      <GlobalStyle />
      <Page>
        <Card>
          <Header>
            <Brand>
              <LogoBox>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </LogoBox>
              <BrandName>EduConnect</BrandName>
            </Brand>
            <HeaderTitle>Join the community</HeaderTitle>
            <HeaderSub>Connect, collaborate, and grow with peers across campus.</HeaderSub>
          </Header>

          <Body>
            <RoleLabel>I am a</RoleLabel>
            <RoleGrid>
              <RoleTile type="button" $active={role === 'student'} onClick={() => setRole('student')}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                Student
              </RoleTile>
              <RoleTile type="button" $active={role === 'lecturer'} onClick={() => setRole('lecturer')}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h20"/>
                  <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/>
                  <path d="m7 21 5-5 5 5"/>
                </svg>
                Lecturer
              </RoleTile>
            </RoleGrid>

            {/* Full name */}
            <Field>
              <Label htmlFor="name">Full name</Label>
              <InputWrap>
                <FieldIcon $focused={focused === 'name'}>
                  <IconUser />
                </FieldIcon>
                <Input
                  id="name" name="name" type="text"
                  placeholder="e.g. Ian Kitheka"
                  value={form.name}
                  onChange={handleChange}
                  $focused={focused === 'name'}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                />
              </InputWrap>
            </Field>

            {/* Email */}
            <Field>
              <Label htmlFor="email">University email</Label>
              <InputWrap>
                <FieldIcon $focused={focused === 'email'}>
                  <IconMail />
                </FieldIcon>
                <Input
                  id="email" name="email" type="email"
                  placeholder="you@university.ac.ke"
                  value={form.email}
                  onChange={handleChange}
                  $focused={focused === 'email'}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                />
              </InputWrap>
            </Field>

            {/* Password */}
            <Field>
              <Label htmlFor="password">Password</Label>
              <InputWrap>
                <FieldIcon $focused={focused === 'password'}>
                  <IconLock />
                </FieldIcon>
                <Input
                  id="password" name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  $focused={focused === 'password'}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                />
                <EyeBtn type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <IconEyeOff /> : <IconEye />}
                </EyeBtn>
              </InputWrap>
            </Field>

            <SignUpBtn type="button">
              <IconRocket /> Create my account
            </SignUpBtn>

            <Divider>or continue with</Divider>

            <GoogleBtn type="button">
              <GoogleLogo /> Sign up with Google
            </GoogleBtn>

            <Footer>Already have an account? <a href="#">Log in</a></Footer>
            <Terms>
              By signing up you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </Terms>
          </Body>
        </Card>
      </Page>
    </>
  );
}

export default SignUpForm;