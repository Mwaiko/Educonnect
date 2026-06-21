import { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { getGroups, joinGroup, getMatchedGroups } from '../../api/groups';
import { useTheme } from '../../context/ThemeContext';
import GroupForm from './GroupForm';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
`;

const Page = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', system-ui, sans-serif;
`;
const TopBar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem;
`;
const TitleGroup = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const PageTitle = styled.h1`
  font-size: 22px; font-weight: 600;
  color: ${({ $c }) => $c.text};
`;
const PageSub = styled.p`
  font-size: 13px;
  color: ${({ $c }) => $c.textSecondary};
`;
const AddBtn = styled.button`
  display: inline-flex; align-items: center; gap: 7px;
  background: ${({ $c }) => $c.primary};
  color: ${({ $c }) => $c.white};
  border: none;
  padding: 9px 18px; border-radius: 8px;
  font-size: 14px; font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  text-decoration: none;
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
  border: 1px solid ${({ $active, $c }) => $active ? $c.primary : $c.border};
  background: ${({ $active, $c }) => $active ? $c.primary : $c.surfaceElevated};
  color: ${({ $active, $c }) => $active ? $c.white : $c.primary};
  &:hover {
    background: ${({ $c }) => $c.primary};
    color: ${({ $c }) => $c.white};
    border-color: ${({ $c }) => $c.primary};
  }
`;
const FilterBar = styled.div`
  display: flex; gap: 10px; margin-bottom: 1.5rem; flex-wrap: wrap;
`;
const SearchInput = styled.input`
  flex: 1; min-width: 220px; padding: 9px 14px;
  border: 1px solid ${({ $c }) => $c.border};
  border-radius: 8px;
  font-size: 14px; font-family: 'Inter', system-ui, sans-serif;
  background: ${({ $c }) => $c.inputBg};
  color: ${({ $c }) => $c.text};
  outline: none;
  &:focus {
    border-color: ${({ $c }) => $c.primary};
    box-shadow: 0 0 0 3px ${({ $c }) => $c.primaryLight};
  }
  &::placeholder { color: ${({ $c }) => $c.textSecondary}; }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;
const Card = styled.div`
  background: ${({ $c }) => $c.surfaceElevated};
  border: 0.5px solid ${({ $c }) => $c.border};
  border-top: 3px solid ${({ $full, $c }) => $full ? $c.accent : $c.primary};
  border-radius: 12px; padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
  transition: box-shadow 0.15s;
  &:hover { box-shadow: ${({ $c }) => $c.hoverShadow}; }
`;
const CardName = styled.h3`
  font-size: 15px; font-weight: 500;
  color: ${({ $c }) => $c.text};
`;
const CardMeta = styled.div`display: flex; gap: 6px; align-items: center; flex-wrap: wrap;`;
const Badge = styled.span`
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 500;
  background: ${({ $c }) => $c.primaryLight};
  color: ${({ $c }) => $c.primary};
`;
const CyanBadge = styled(Badge)`
  background: ${({ $c }) => $c.accentLight};
  color: ${({ $c }) => $c.accent};
`;
const AmberBadge = styled(Badge)`
  background: ${({ $c }) => $c.warningLight};
  color: ${({ $c }) => $c.warning};
`;
const CardFooter = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px; border-top: 0.5px solid ${({ $c }) => $c.border};
  margin-top: auto;
`;
const MemberCount = styled.span`
  font-size: 12px;
  color: ${({ $c }) => $c.textSecondary};
`;
const JoinBtn = styled.button`
  display: inline-flex; align-items: center; gap: 4px;
  background: ${({ $c }) => $c.primaryLight};
  color: ${({ $c }) => $c.primary};
  border: 1px solid ${({ $c }) => $c.border};
  font-size: 12px; font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer; padding: 5px 12px; border-radius: 6px;
  transition: all 0.15s;
  &:hover { background: ${({ $c }) => $c.primary}; color: ${({ $c }) => $c.white}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const EmptyState = styled.div`
  text-align: center; padding: 4rem 2rem;
  background: ${({ $c }) => $c.surfaceElevated};
  border: 0.5px solid ${({ $c }) => $c.border};
  border-radius: 12px;
`;
const Loading = styled.div`
  text-align: center; padding: 4rem;
  color: ${({ $c }) => $c.textSecondary};
  font-size: 14px;
`;
const Spinner = styled.div`
  width: 28px; height: 28px;
  border: 3px solid ${({ $c }) => $c.primaryLight};
  border-top-color: ${({ $c }) => $c.primary};
  border-radius: 50%; animation: spin 0.7s linear infinite;
  margin: 0 auto 1rem;
  @keyframes spin { to { transform: rotate(360deg); } }
`;
const SuccessMsg = styled.div`
  background: ${({ $c }) => $c.successLight};
  border: 1px solid ${({ $c }) => $c.success};
  border-radius: 8px; padding: 10px 14px;
  font-size: 13px; color: ${({ $c }) => $c.success}; margin-bottom: 1rem;
`;

export default function GroupList({ onAdd, onView }) {
  const { C } = useTheme();
  const [groups, setGroups] = useState([]);
  const [matched, setMatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('my');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

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

  const handleGroupCreated = () => {
    setSuccessMsg('Study group created.');
    setTimeout(() => setSuccessMsg(''), 3000);
    if (tab === 'my') fetchGroups();
  };

  const displayGroups = tab === 'my' ? groups : matched;

  return (
    <>
      <GlobalStyle />
      <Page>
        <TopBar>
          <TitleGroup>
            <PageTitle $c={C}>Study Groups</PageTitle>
            <PageSub $c={C}>Connect and collaborate with other students who share your interests.</PageSub>
          </TitleGroup>
          <AddBtn $c={C} onClick={() => setShowForm(true)}>
            + Create Group
          </AddBtn>
        </TopBar>

        {successMsg && <SuccessMsg $c={C}>✓ {successMsg}</SuccessMsg>}

        <TabRow>
          <Tab $c={C} $active={tab === 'my'} onClick={() => setTab('my')}>My Groups</Tab>
          <Tab $c={C} $active={tab === 'discover'} onClick={() => setTab('discover')}>Discover</Tab>
        </TabRow>

        {tab === 'my' && (
          <FilterBar>
            <SearchInput
              $c={C}
              placeholder="Filter by subject."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </FilterBar>
        )}

        {loading ? (
          <Loading $c={C}><Spinner $c={C} />Loading groups...</Loading>
        ) : displayGroups.length === 0 ? (
          <EmptyState $c={C}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: C.text, marginBottom: '6px' }}>
              {tab === 'my' ? 'No groups yet' : 'No matched groups found'}
            </p>
            <p style={{ fontSize: '13px', color: C.textSecondary, marginBottom: '1.25rem' }}>
              {tab === 'my' ? 'Create a group or join one from Discover.' : 'Update your subject interests to get better matches.'}
            </p>
            {tab === 'my' && (
              <AddBtn $c={C} onClick={() => setShowForm(true)} style={{ margin: '0 auto' }}>
                + Create Group
              </AddBtn>
            )}
          </EmptyState>
        ) : (
          <Grid>
            {displayGroups.map(group => (
              <Card $c={C} key={group.id} $full={group.is_full}>
                <CardName $c={C}>{group.name}</CardName>
                <CardMeta>
                  {group.subject_tag && <Badge $c={C}>{group.subject_tag}</Badge>}
                  <CyanBadge $c={C}>{group.formation_type}</CyanBadge>
                  {group.is_full && <AmberBadge $c={C}>Full</AmberBadge>}
                </CardMeta>
                <CardFooter $c={C}>
                  <MemberCount $c={C}>{group.member_count} / {group.max_members} members</MemberCount>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <JoinBtn $c={C} onClick={() => onView(group.id)}>View</JoinBtn>
                    {tab === 'discover' && (
                      <JoinBtn
                        $c={C}
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

      {showForm && (
        <GroupForm
          onClose={() => setShowForm(false)}
          onSuccess={handleGroupCreated}
        />
      )}
    </>
  );
}