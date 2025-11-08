import styled from 'styled-components'

const ProjectCard = ({ project }) => {
  return (
    <Card>
      <Status status={project.status}>{project.status}</Status>
      <Title>{project.title}</Title>
      <Description>{project.description}</Description>
      <Footer>
        <Progress>
          <ProgressBar progress={project.progress} />
          <ProgressText>{project.progress}%</ProgressText>
        </Progress>
        <DueDate>Due: {new Date(project.dueDate).toLocaleDateString()}</DueDate>
      </Footer>
    </Card>
  )
}

const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`

const Status = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  background: ${props => {
    switch (props.status) {
      case 'planned': return '#e3f2fd';
      case 'in-progress': return '#fff3e0';
      case 'completed': return '#e8f5e9';
      case 'on-hold': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
`

const Title = styled.h3`
  margin: 1rem 0;
`

const Description = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Progress = styled.div`
  flex: 1;
  margin-right: 1rem;
`

const ProgressBar = styled.div`
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: #4caf50;
    border-radius: 3px;
  }
`

const ProgressText = styled.span`
  font-size: 0.8rem;
  color: #666;
`

const DueDate = styled.span`
  font-size: 0.8rem;
  color: #666;
`

export default ProjectCard