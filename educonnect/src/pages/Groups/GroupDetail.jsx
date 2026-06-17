import { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { getGroup, leaveGroup, createMeetingLink } from '../../api/groups';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #F8FAFC; color: #1E1B4B; }
`;

const Page = styled.div`padding: 2rem; max-width: 900px; margin: 0 auto;`;
const BackBtn = styled.button`
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none; color: #4F46E5;
  font-size: 14px; font-weight: 500; cursor: pointer;
  font-family: 'Inter', system-ui, sans-serif;
  margin-bottom: 1.5rem; padding: 0;
  &:hover { opacity: 0.75; }
`;
const Header = styled.div`
  background: #4F46E5; border-radius: 12px;
  padding: 1.75rem 2rem; margin-bottom: 1.5rem;
`;
const GroupName = styled.h1`font-size: 22px; font-weight: 600; color: #fff; margin-bottom: 6px;`;
const HeaderMeta = styled.div`display: flex; gap: 8px; flex-wrap: wrap;`;
const Badge = styled.span`
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 500;
  background: rgba(255,255,255,0.2); color: #fff;
`;
const Grid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
const Card = styled.div`
  background: #fff; border: 0.5px solid rgba(79,70,229,0.18);
  border-radius: 12px; padding: 16px;
`;
const CardTitle = styled.h2`
  font-size: 13px; font-weight: 500; letter-spacing: 0.07em;
  text-transform: uppercase; color: #6B7280; margin-bottom: 1rem;
`;
const MemberRow = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 0.5px solid rgba(79,70,229,0.08);
  &:last-child { border-bottom: none; }
`;
const Avatar = styled.div`
  width: 32px; height: 32px; border-radius: 50%;
  background: #4F46E5; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; flex-shrink: 0;
`;
const MemberInfo = styled.div`display: flex; flex-direction: column;`;
const MemberName = styled.span`font-size: 13px; font-weight: 500; color: #1E1B4B;`;
const MemberEmail = styled.span`font-size: 11px; color: #6B7280;`;
const MeetingRow = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0; border-bottom: 0.5px solid rgba(79,70,229,0.08);
  &:last-child { border-bottom: none; }
`;
const MeetingUrl = styled.a`
  font-size: 13px; color: #4F46E5; text-decoration: none;
  &:hover { text-decoration: underline; }
`;
const MeetingTime = styled.span`font-size: 11px; color: #6B7280;`;
const ProviderBadge = styled.span`
  padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 500;
  background: #ECFEFF; color: #0E7490;
`;
const ActionRow = styled.div`
  display: flex; gap: 10px; margin-top: 1.5rem; flex-wrap: wrap;
`;
const PrimaryBtn = styled.button`
  display: inline-flex; align-items: center; gap: 7px;
  background: #4F46E5; color: #fff; border: none;
  padding: 9px 18px; border-radius: 8px;
  font-size: 14px; font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer; transition: opacity 0.15s;
  &:hover { opacity: 0.88; }
`;
const DangerBtn = styled.button`
  display: inline-flex; align-items: center; gap: 4px;
  background: #FEF2F2; color: #EF4444;
  border: 1px solid rgba(239,68,68,0.25);
  font-size: 14px; font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer; padding: 9px 18px; border-radius: 8px;
  &:hover { opacity: 0.8; }
`;
const Select = styled.select`
  padding: 9px 12px; border: 1px solid rgba(79,70,229,0.25);
  border-radius: 8px; font-size: 14px;
  font-family: 'Inter', system-ui, sans-serif;
  background: #fff; color: #1E1B4B; outline: none; cursor: pointer;
  &:focus { border-color: #4F46E5; }
`;
const Loading = styled.div`text-align: center; padding: 4rem; color: #6B7280; font-size: 14px;`;
const Spinner = styled.div`
  width: 28px; height: 28px;
  border: 3px solid #EEF2FF; border-top-color: #4F46E5;
  border-radius: 50%; animation: spin 0.7s linear infinite;
  margin: 0 auto 1rem;
  @keyframes spin { to { transform: rotate(360deg); } }
`;
const SuccessMsg = styled.div`
  background: #ECFDF5; border: 1px solid rgba(16,185,129,0.25);
  border-radius: 8px; padding: 10px 14px;
  font-size: 13px; color: #065F46; margin-bottom: 1rem;
`;

export default function GroupDetail({ groupId, onBack }) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState('google_meet');
  const [successMsg, setSuccessMsg] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await getGroup(groupId);
      setGroup(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      await leaveGroup(groupId);
      onBack();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    try {
      await createMeetingLink(groupId, { provider });
      setSuccessMsg('Meeting link generated.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchGroup();
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingLink(false);
    }
  };

  if (loading) return <Loading><Spinner />Loading group...</Loading>;
  if (!group) return <Loading>Group not found.</Loading>;

  return (
    <>
      <GlobalStyle />
      <Page>
        <BackBtn onClick={onBack}>← Back to groups</BackBtn>

        <Header>
          <GroupName>{group.name}</GroupName>
          <HeaderMeta>
            {group.subject_tag && <Badge>{group.subject_tag}</Badge>}
            <Badge>{group.formation_type}</Badge>
            <Badge>{group.member_count} / {group.max_members} members</Badge>
            {group.is_full && <Badge style={{ background: 'rgba(245,158,11,0.3)' }}>Full</Badge>}
          </HeaderMeta>
        </Header>

        {successMsg && <SuccessMsg>✓ {successMsg}</SuccessMsg>}

        <Grid>
          <Card>
            <CardTitle>Members</CardTitle>
            {group.members && group.members.length > 0 ? (
              group.members.map(m => (
                <MemberRow key={m.id}>
                  <Avatar>
                    {(m.user.username || m.user.email).slice(0, 2).toUpperCase()}
                  </Avatar>
                  <MemberInfo>
                    <MemberName>{m.user.username || m.user.email}</MemberName>
                    <MemberEmail>{m.user.email}</MemberEmail>
                  </MemberInfo>
                </MemberRow>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: '#6B7280' }}>No members yet.</p>
            )}
          </Card>

          <Card>
            <CardTitle>Meeting Links</CardTitle>
            {group.meeting_links && group.meeting_links.length > 0 ? (
              group.meeting_links.map(link => (
                <MeetingRow key={link.id}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <MeetingUrl href={link.meeting_url} target="_blank" rel="noopener noreferrer">
                      {link.meeting_url}
                    </MeetingUrl>
                    {link.scheduled_at && (
                      <MeetingTime>{new Date(link.scheduled_at).toLocaleString()}</MeetingTime>
                    )}
                  </div>
                  <ProviderBadge>{link.provider.replace('_', ' ')}</ProviderBadge>
                </MeetingRow>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: '#6B7280' }}>No meeting links yet.</p>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', flexWrap: 'wrap' }}>
              <Select value={provider} onChange={e => setProvider(e.target.value)}>
                <option value="google_meet">Google Meet</option>
                <option value="zoom">Zoom</option>
              </Select>
              <PrimaryBtn onClick={handleGenerateLink} disabled={generatingLink}>
                {generatingLink ? 'Generating...' : '+ Generate Link'}
              </PrimaryBtn>
            </div>
          </Card>
        </Grid>

        <ActionRow>
          <DangerBtn onClick={handleLeave}>Exit Group</DangerBtn>
        </ActionRow>
      </Page>
    </>
  );
}