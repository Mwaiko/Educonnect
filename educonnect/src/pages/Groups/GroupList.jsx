import { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { getGroups, joinGroup, getMatchedGroups } from '../../api/groups';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #F8FAFC; color: #1E1B4B; }
`;

const Page = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;
const TopBar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem;
`;
const TitleGroup = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const PageTitle = styled.h1`font-size: 22px; font-weight: 600; color: #1E1B4B;`;
const PageSub = styled.p`font-size: 13px; color: #6B7280;`;
const AddBtn = styled.button`
  display: inline-flex; align-items: center; gap: 7px;
  background: #4F46E5; color: #fff; border: none;
  padding: 9px 18px; border-radius: 8px;
  font-size: 14px; font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer; transition: opacity 0.15s;
  &:hover { opacity: 0.88; }
`;
const TabRow = styled.div`
  display: flex; gap: 8px; margin-bottom: 1.5rem;
`;
const Tab = styled.button`
  padding: 7px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer; transition: all 0.15s;
  border: 1px solid ${({ $active }) => $active ? '#4F46E5' : 'rgba(79,70,229,0.2)'};
  background: ${({ $active }) => $active ? '#4F46E5' : '#fff'};
  color: ${({ $active }) => $active ? '#fff' : '#4F46E5'};
  &:hover { background: #4F46E5; color: #fff; border-color: #4F46E5; }
`;
const FilterBar = styled.div`
  display: flex; gap: 10px; margin-bottom: 1.5rem; flex-wrap: wrap;
`;
const SearchInput = styled.input`
  flex: 1; min-width: 220px; padding: 9px 14px;
  border: 1px solid rgba(79,70,229,0.25); border-radius: 8px;
  font-size: 14px; font-family: 'Inter', system-ui, sans-serif;
  background: #fff; color: #1E1B4B; outline: none;
  &:focus { border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
  &::placeholder { color: #9CA3AF; }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;
const Card = styled.div`
  background: #fff;
  border: 0.5px solid rgba(79,70,229,0.18);
  border-top: 3px solid ${({ $full }) => $full ? '#06B6D4' : '#4F46E5'};
  border-radius: 12px; padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
  transition: box-shadow 0.15s;
  &:hover { box-shadow: 0 4px 16px rgba(79,70,229,0.10); }
`;
const CardName = styled.h3`font-size: 15px; font-weight: 500; color: #1E1B4B;`;
const CardMeta = styled.div`display: flex; gap: 6px; align-items: center; flex-wrap: wrap;`;
const Badge = styled.span`
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 500;
  background: #EEF2FF; color: #4F46E5;
`;
const CyanBadge = styled(Badge)`background: #ECFEFF; color: #0E7490;`;
const AmberBadge = styled(Badge)`background: #FFFBEB; color: #92400E;`;
const CardFooter = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px; border-top: 0.5px solid rgba(79,70,229,0.12);
  margin-top: auto;
`;
const MemberCount = styled.span`font-size: 12px; color: #6B7280;`;
const JoinBtn = styled.button`
  display: inline-flex; align-items: center; gap: 4px;
  background: #EEF2FF; color: #4F46E5;
  border: 1px solid rgba(79,70,229,0.25);
  font-size: 12px; font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer; padding: 5px 12px; border-radius: 6px;
  transition: all 0.15s;
  &:hover { background: #4F46E5; color: #fff; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const EmptyState = styled.div`
  text-align: center; padding: 4rem 2rem;
  background: #fff; border: 0.5px solid rgba(79,70,229,0.18); border-radius: 12px;
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

export default function GroupList({ onAdd, onView }) {
  const [groups, setGroups] = useState([]);
  const [matched, setMatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('my');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchGroups = async () => {
    setLoading(true);
    try {
      if (tab === 'my') {
        const params = {};
        if (search) params.subject_tag = search;
        const res = await getGroups(params);
        setGroups(res.data.results || res.data);
      } else {
        const res = await getMatchedGroups();
        setMatched(res.data.results || res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchGroups, 400);
    return () => clearTimeout(delay);
  }, [tab, search]);

  const handleJoin = async (id) => {
    try {
      await joinGroup(id);
      setSuccessMsg('You have joined the group.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const displayGroups = tab === 'my' ? groups : matched;

  return (
    <>
      <GlobalStyle />
      <Page>
        <TopBar>
          <TitleGroup>
            <PageTitle>Study Groups</PageTitle>
            <PageSub>Connect and collaborate with other students who share your interests.</PageSub>
          </TitleGroup>
          <AddBtn onClick={onAdd}>+ Create Group</AddBtn>
        </TopBar>

        {successMsg && <SuccessMsg>✓ {successMsg}</SuccessMsg>}

        <TabRow>
          <Tab $active={tab === 'my'} onClick={() => setTab('my')}>My Groups</Tab>
          <Tab $active={tab === 'discover'} onClick={() => setTab('discover')}>Discover</Tab>
        </TabRow>

        {tab === 'my' && (
          <FilterBar>
            <SearchInput
              placeholder="Filter by subject."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </FilterBar>
        )}

        {loading ? (
          <Loading><Spinner />Loading groups...</Loading>
        ) : displayGroups.length === 0 ? (
          <EmptyState>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#1E1B4B', marginBottom: '6px' }}>
              {tab === 'my' ? 'No groups yet' : 'No matched groups found'}
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '1.25rem' }}>
              {tab === 'my' ? 'Create a group or join one from Discover.' : 'Update your subject interests to get better matches.'}
            </p>
            {tab === 'my' && <AddBtn onClick={onAdd} style={{ margin: '0 auto' }}>+ Create Group</AddBtn>}
          </EmptyState>
        ) : (
          <Grid>
            {displayGroups.map(group => (
              <Card key={group.id} $full={group.is_full}>
                <CardName>{group.name}</CardName>
                <CardMeta>
                  {group.subject_tag && <Badge>{group.subject_tag}</Badge>}
                  <CyanBadge>{group.formation_type}</CyanBadge>
                  {group.is_full && <AmberBadge>Full</AmberBadge>}
                </CardMeta>
                <CardFooter>
                  <MemberCount>{group.member_count} / {group.max_members} members</MemberCount>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <JoinBtn onClick={() => onView(group.id)}>View</JoinBtn>
                    {tab === 'discover' && (
                      <JoinBtn
                        onClick={() => handleJoin(group.id)}
                        disabled={group.is_full}
                      >
                        {group.is_full ? 'Full' : 'Join'}
                      </JoinBtn>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </Grid>
        )}
      </Page>
    </>
  );
}