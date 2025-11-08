import styled from 'styled-components'

const StatusFilter = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'planned', label: 'Planned' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'on-hold', label: 'On Hold' }
  ]

  return (
    <FilterContainer>
      {filters.map(filter => (
        <FilterButton
          key={filter.id}
          active={activeFilter === filter.id}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </FilterButton>
      ))}
    </FilterContainer>
  )
}

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
`

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  background: ${props => props.active ? '#007bff' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#0056b3' : '#e0e0e0'};
  }
`

export default StatusFilter