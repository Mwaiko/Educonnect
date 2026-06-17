import { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { createGroup } from '../../api/groups';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #F8FAFC; color: #1E1B4B; }
`;

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(30,27,75,0.35);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 1rem;
`;
const Modal = styled.div`
  background: #fff; border-radius: 16px;
  width: 100%; max-width: 460px; padding: 2rem;
  border: 0.5px solid rgba(79,70,229,0.18);
`;
const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.5rem;
`;
const ModalTitle = styled.h2`font-size: 18px; font-weight: 600; color: #1E1B4B;`;
const CloseBtn = styled.button`
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid rgba(79,70,229,0.2);
  background: #fff; color: #6B7280; font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: #EEF2FF; color: #4F46E5; }
`;
const Field = styled.div`margin-bottom: 1rem;`;
const Label = styled.label`
  display: block; font-size: 12px; font-weight: 500; color: #6B7280;
  text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px;
`;
const Input = styled.input`
  width: 100%; padding: 9px 12px;
  border: 1px solid rgba(79,70,229,0.25); border-radius: 8px;
  font-size: 14px; font-family: 'Inter', system-ui, sans-serif;
  background: #fff; color: #1E1B4B; outline: none;
  &:focus { border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
  &::placeholder { color: #9CA3AF; }
`;
const Select = styled.select`
  width: 100%; padding: 9px 12px;
  border: 1px solid rgba(79,70,229,0.25); border-radius: 8px;
  font-size: 14px; font-family: 'Inter', system-ui, sans-serif;
  background: #fff; color: #1E1B4B; outline: none; cursor: pointer;
  &:focus { border-color: #4F46E5; }
`;
const ErrorMsg = styled.p`font-size: 12px; color: #EF4444; margin-top: 4px;`;
const SuccessMsg = styled.div`
  background: #ECFDF5; border: 1px solid rgba(16,185,129,0.25);
  border-radius: 8px; padding: 10px 14px;
  font-size: 13px; color: #065F46; margin-bottom: 1rem;
`;
const BtnRow = styled.div`display: flex; gap: 10px; margin-top: 1.5rem;`;
const SubmitBtn = styled.button`
  flex: 1; padding: 10px;
  background: #4F46E5; color: #fff; border: none;
  border-radius: 8px; font-size: 14px; font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer; transition: opacity 0.15s;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const CancelBtn = styled.button`
  padding: 10px 20px; background: #fff; color: #4F46E5;
  border: 1px solid rgba(79,70,229,0.25); border-radius: 8px;
  font-size: 14px; font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif; cursor: pointer;
  &:hover { background: #EEF2FF; }
`;
const HintText = styled.p`font-size: 12px; color: #6B7280; margin-top: 4px;`;

export default function GroupForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', subject_tag: '', max_members: 8 });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Group name is required';
    if (form.max_members < 2) e.max_members = 'Must have at least 2 members';
    if (form.max_members > 20) e.max_members = 'Cannot exceed 20 members';
    return e;
  };

  const handleChange = (e) => {
    const val = e.target.name === 'max_members' ? parseInt(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await createGroup(form);
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err) {
      setErrors({ general: 'Failed to create group. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
        <Modal>
          <ModalHeader>
            <ModalTitle>Create a study group</ModalTitle>
            <CloseBtn onClick={onClose}>✕</CloseBtn>
          </ModalHeader>

          {success && <SuccessMsg>✓ Group created successfully!</SuccessMsg>}
          {errors.general && <ErrorMsg style={{ marginBottom: '1rem' }}>{errors.general}</ErrorMsg>}

          <Field>
            <Label htmlFor="name">Group name</Label>
            <Input
              id="name" name="name"
              placeholder="e.g. Algorithms Study Group — Week 3"
              value={form.name} onChange={handleChange}
            />
            {errors.name && <ErrorMsg>{errors.name}</ErrorMsg>}
          </Field>

          <Field>
            <Label htmlFor="subject_tag">Subject</Label>
            <Select id="subject_tag" name="subject_tag" value={form.subject_tag} onChange={handleChange}>
              <option value="">Select a subject</option>
              <option value="Algorithms">Algorithms</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Databases">Databases</option>
              <option value="Networks">Networks</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Web Development">Web Development</option>
              <option value="Computer Architecture">Computer Architecture</option>
            </Select>
          </Field>

          <Field>
            <Label htmlFor="max_members">Max members</Label>
            <Input
              id="max_members" name="max_members" type="number"
              min="2" max="20"
              value={form.max_members} onChange={handleChange}
            />
            <HintText>Between 2 and 20 members. Default is 8.</HintText>
            {errors.max_members && <ErrorMsg>{errors.max_members}</ErrorMsg>}
          </Field>

          <BtnRow>
            <CancelBtn onClick={onClose}>Cancel</CancelBtn>
            <SubmitBtn onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </SubmitBtn>
          </BtnRow>
        </Modal>
      </Overlay>
    </>
  );
}