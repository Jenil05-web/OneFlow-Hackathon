import styled from 'styled-components'

const KpiWidget = ({ title, value, icon }) => {
  return (
    <KpiCard>
      <IconContainer>
        {/* Add your icon component or icon library here */}
      </IconContainer>
      <Content>
        <Title>{title}</Title>
        <Value>{value}</Value>
      </Content>
    </KpiCard>
  )
}

const KpiCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
`

const IconContainer = styled.div`
  margin-right: 1rem;
`

const Content = styled.div`
  flex: 1;
`

const Title = styled.h3`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`

const Value = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 0.5rem;
`

export default KpiWidget