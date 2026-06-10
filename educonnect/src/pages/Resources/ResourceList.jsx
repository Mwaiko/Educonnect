import { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { getResources, voteResource, deleteResource } from '../../api/resources';

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
  font-size: 14px; font-weight: 500; font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer; transition: opacity 0.15s;
  &:hover { opacity: 0.88; }
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
const Select = styled.select`
  padding: 9px 14px; border: 1px solid rgba(79,70,229,0.25);
  border-radius: 8px; font-size: 14px;
  font-family: 'Inter', system-ui, sans-serif;
  background: #fff; color: #1E1B4B; outline: none; cursor: pointer;
  &:focus { border-color: #4F46E5; }
`;
const ResultCount = styled.p`
  font-size: 12px; font-weight: 500; letter-spacing: 0.07em;
  text-transform: uppercase; color: #6B7280; margin-bottom: 1rem;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;
const Card = styled.div`
  background: #fff; border: 0.5px solid rgba(79,70,229,0.18);
  border-top: 3px solid #4F46E5; border-radius: 12px;
  padding: 16px; display: flex; flex-direction: column; gap: 10px;
  &:hover { box-shadow: 0 4px 16px rgba(79,70,229,0.10); }
`;
const CardTitle = styled.a`
  font-size: 15px; font-weight: 500; color: #1E1B4B;
  text-decoration: none; line-height: 1.4;
  &:hover { color: #4F46E5; }
`;
const CardMeta = styled.div`display: flex; gap: 6px; align-items: center; flex-wrap: wrap;`;
const Badge = styled.span`
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 500;
  background: #EEF2FF; color: #4F46E5;
`;
const TypeBadge = styled(Badge)`background: #ECFEFF; color: #0E7490;`;
const Submitter = styled.p`font-size: 12px; color: #6B7280; margin-top: auto;`;
const CardFooter = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px; border-top: 0.5px solid rgba(79,70,229,0.12);
`;
const VoteRow = styled.div`display: flex; align-items: center; gap: 6px;`;
const VoteBtn = styled.button`
  width: 30px; height: 30px; border-radius: 6px;
  border: 1px solid rgba(79,70,229,0.2);
  background: ${({ $active }) => $active ? '#4F46E5' : '#fff'};
  color: ${({ $active }) => $active ? '#fff' : '#4F46E5'};
  font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: #4F46E5; color: #fff; }
`;
const VoteCount = styled.span`
  font-size: 14px; font-weight: 600; color: #1E1B4B;
  min-width: 24px; text-align: center;
`;
const DeleteBtn = styled.button`
  display: inline-flex; align-items: center; gap: 4px;
  background: #FEF2F2; color: #EF4444;
  border: 1px solid rgba(239,68,68,0.25);
  font-size: 12px; font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer; padding: 5px 10px; border-radius: 6px;
  &:hover { opacity: 0.8; }
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

export default function ResourceList({ onAdd }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setResources(res.data.results || res.data);
    } catch (err) {
      console.error(err);
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
      <Page>
        <TopBar>
          <TitleGroup>
            <PageTitle>Resource Repository</PageTitle>
            <PageSub>Community-ranked study materials, textbooks and articles</PageSub>
          </TitleGroup>
          <AddBtn onClick={onAdd}>+ Add Resource</AddBtn>
        </TopBar>
        <FilterBar>
          <SearchInput
            placeholder="Search by title or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Select value={tag} onChange={e => setTag(e.target.value)}>
            <option value="">All subjects</option>
            <option value="algorithms">Algorithms</option>
            <option value="mathematics">Mathematics</option>
            <option value="data-structures">Data Structures</option>
            <option value="databases">Databases</option>
            <option value="networks">Networks</option>
          </Select>
          <Select value={resourceType} onChange={e => setResourceType(e.target.value)}>
            <option value="">All types</option>
            <option value="textbook">Textbook</option>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="website">Website</option>
            <option value="other">Other</option>
          </Select>
        </FilterBar>
        {loading ? (
          <Loading><Spinner />Loading resources...</Loading>
        ) : resources.length === 0 ? (
          <EmptyState>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#1E1B4B', marginBottom: '6px' }}>No resources found</p>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '1.25rem' }}>Be the first to add a study resource.</p>
            <AddBtn onClick={onAdd} style={{ margin: '0 auto' }}>+ Add Resource</AddBtn>
          </EmptyState>
        ) : (
          <>
            <ResultCount>{resources.length} resource{resources.length !== 1 ? 's' : ''} found</ResultCount>
            <Grid>
              {resources.map(resource => (
                <Card key={resource.id}>
                  <CardTitle href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.title}
                  </CardTitle>
                  <CardMeta>
                    {resource.tag && <Badge>{resource.tag}</Badge>}
                    {resource.resource_type && <TypeBadge>{resource.resource_type}</TypeBadge>}
                  </CardMeta>
                  {resource.submitted_by && (
                    <Submitter>Submitted by {resource.submitted_by.username}</Submitter>
                  )}
                  <CardFooter>
                    <VoteRow>
                      <VoteBtn $active={resource.user_vote === 1} onClick={() => handleVote(resource.id, 1)}>▲</VoteBtn>
                      <VoteCount>{resource.net_votes}</VoteCount>
                      <VoteBtn $active={resource.user_vote === -1} onClick={() => handleVote(resource.id, -1)}>▼</VoteBtn>
                    </VoteRow>
                    <DeleteBtn onClick={() => handleDelete(resource.id)}>Delete</DeleteBtn>
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