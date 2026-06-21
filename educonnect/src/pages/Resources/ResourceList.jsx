import { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { getResources, voteResource, deleteResource } from '../../api/resources';
import { useTheme } from '../../context/ThemeContext';

const GlobalStyle = createGlobalStyle`
  /* Inter font is loaded via a <link> tag below instead of @import — styled-components'
     createGlobalStyle can't reliably process @import at runtime (see console warning). */
  /* Scoped reset only — this component renders inside the main dashboard shell (which
     controls its own light/dark background via ThemeContext), so we never touch body styles here. */
  .resource-list-page, .resource-list-page *, .resource-list-page *::before, .resource-list-page *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Inter', system-ui, sans-serif;
  }
`;

const Page = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: ${({ $c }) => $c.surface};
  color: ${({ $c }) => $c.text};
  border-radius: 16px;
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
  font-size: 14px; font-weight: 500; font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer; transition: opacity 0.15s;
  &:hover { opacity: 0.88; }
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
const Select = styled.select`
  padding: 9px 14px; border: 1px solid ${({ $c }) => $c.border};
  border-radius: 8px; font-size: 14px;
  font-family: 'Inter', system-ui, sans-serif;
  background: ${({ $c }) => $c.inputBg};
  color: ${({ $c }) => $c.text};
  outline: none; cursor: pointer;
  &:focus { border-color: ${({ $c }) => $c.primary}; }
`;
const ResultCount = styled.p`
  font-size: 12px; font-weight: 500; letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${({ $c }) => $c.textSecondary};
  margin-bottom: 1rem;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;
const Card = styled.div`
  background: ${({ $c }) => $c.surfaceElevated};
  border: 0.5px solid ${({ $c }) => $c.border};
  border-top: 3px solid ${({ $c }) => $c.primary};
  border-radius: 12px;
  padding: 16px; display: flex; flex-direction: column; gap: 10px;
  &:hover { box-shadow: ${({ $c }) => $c.hoverShadow}; }
`;
const CardTitle = styled.a`
  font-size: 15px; font-weight: 500;
  color: ${({ $c }) => $c.text};
  text-decoration: none; line-height: 1.4;
  &:hover { color: ${({ $c }) => $c.primary}; }
`;
const CardMeta = styled.div`display: flex; gap: 6px; align-items: center; flex-wrap: wrap;`;
const Badge = styled.span`
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 500;
  background: ${({ $c }) => $c.primaryLight};
  color: ${({ $c }) => $c.primary};
`;
const TypeBadge = styled(Badge)`
  background: ${({ $c }) => $c.accentLight};
  color: ${({ $c }) => $c.accent};
`;
const Submitter = styled.p`
  font-size: 12px;
  color: ${({ $c }) => $c.textSecondary};
  margin-top: auto;
`;
const CardFooter = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px; border-top: 0.5px solid ${({ $c }) => $c.border};
`;
const VoteRow = styled.div`display: flex; align-items: center; gap: 6px;`;
const VoteBtn = styled.button`
  width: 30px; height: 30px; border-radius: 6px;
  border: 1px solid ${({ $c }) => $c.border};
  background: ${({ $active, $c }) => $active ? $c.primary : $c.surfaceElevated};
  color: ${({ $active, $c }) => $active ? $c.white : $c.primary};
  font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: ${({ $c }) => $c.primary}; color: ${({ $c }) => $c.white}; }
`;
const VoteCount = styled.span`
  font-size: 14px; font-weight: 600;
  color: ${({ $c }) => $c.text};
  min-width: 24px; text-align: center;
`;
const DeleteBtn = styled.button`
  display: inline-flex; align-items: center; gap: 4px;
  background: ${({ $c }) => $c.dangerLight};
  color: ${({ $c }) => $c.danger};
  border: 1px solid ${({ $c }) => $c.danger};
  font-size: 12px; font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer; padding: 5px 10px; border-radius: 6px;
  &:hover { opacity: 0.8; }
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

export default function ResourceList({ onAdd }) {
  const { C } = useTheme();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [resourceType, setResourceType] = useState('');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (tag) params.tag = tag;
      if (resourceType) params.resource_type = resourceType;
      const res = await getResources(params);
      const list = Array.isArray(res.data?.results)
        ? res.data.results
        : Array.isArray(res.data)
        ? res.data
        : [];
      setResources(list);
      setError(null);
    } catch (err) {
      console.error(err);
      setResources([]);
      setError(
        err?.response?.status === 401
          ? 'You need to be logged in to view resources.'
          : 'Something went wrong loading resources. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchResources, 400);
    return () => clearTimeout(delay);
  }, [search, tag, resourceType]);

  const handleVote = async (id, value) => {
    try {
      const res = await voteResource(id, value);
      setResources(prev =>
        prev.map(r => r.id === id
          ? { ...r, net_votes: res.data.net_votes, user_vote: res.data.user_vote }
          : r
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <GlobalStyle />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
      />
      <Page $c={C} className="resource-list-page">
        <TopBar>
          <TitleGroup>
            <PageTitle $c={C}>Resource Repository</PageTitle>
            <PageSub $c={C}>Community-ranked study materials, textbooks and articles</PageSub>
          </TitleGroup>
          <AddBtn $c={C} onClick={onAdd}>+ Add Resource</AddBtn>
        </TopBar>
        <FilterBar>
          <SearchInput
            $c={C}
            placeholder="Search by title or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Select $c={C} value={tag} onChange={e => setTag(e.target.value)}>
            <option value="">All subjects</option>
            <option value="algorithms">Algorithms</option>
            <option value="mathematics">Mathematics</option>
            <option value="data-structures">Data Structures</option>
            <option value="databases">Databases</option>
            <option value="networks">Networks</option>
          </Select>
          <Select $c={C} value={resourceType} onChange={e => setResourceType(e.target.value)}>
            <option value="">All types</option>
            <option value="textbook">Textbook</option>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="website">Website</option>
            <option value="other">Other</option>
          </Select>
        </FilterBar>
        {loading ? (
          <Loading $c={C}><Spinner $c={C} />Loading resources...</Loading>
        ) : error ? (
          <EmptyState $c={C}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: C.text, marginBottom: '6px' }}>{error}</p>
          </EmptyState>
        ) : resources.length === 0 ? (
          <EmptyState $c={C}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: C.text, marginBottom: '6px' }}>No resources found</p>
            <p style={{ fontSize: '13px', color: C.textSecondary, marginBottom: '1.25rem' }}>Be the first to add a study resource.</p>
            <AddBtn $c={C} onClick={onAdd} style={{ margin: '0 auto' }}>+ Add Resource</AddBtn>
          </EmptyState>
        ) : (
          <>
            <ResultCount $c={C}>{resources.length} resource{resources.length !== 1 ? 's' : ''} found</ResultCount>
            <Grid>
              {resources.map(resource => (
                <Card $c={C} key={resource.id}>
                  <CardTitle $c={C} href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.title}
                  </CardTitle>
                  <CardMeta>
                    {resource.tag && <Badge $c={C}>{resource.tag}</Badge>}
                    {resource.resource_type && <TypeBadge $c={C}>{resource.resource_type}</TypeBadge>}
                  </CardMeta>
                  {resource.submitted_by && (
                    <Submitter $c={C}>Submitted by {resource.submitted_by.username}</Submitter>
                  )}
                  <CardFooter $c={C}>
                    <VoteRow>
                      <VoteBtn $c={C} $active={resource.user_vote === 1} onClick={() => handleVote(resource.id, 1)}>▲</VoteBtn>
                      <VoteCount $c={C}>{resource.net_votes}</VoteCount>
                      <VoteBtn $c={C} $active={resource.user_vote === -1} onClick={() => handleVote(resource.id, -1)}>▼</VoteBtn>
                    </VoteRow>
                    <DeleteBtn $c={C} onClick={() => handleDelete(resource.id)}>Delete</DeleteBtn>
                  </CardFooter>
                </Card>
              ))}
            </Grid>
          </>
        )}
      </Page>
    </>
  );
}