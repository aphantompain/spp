import { useState } from 'react'
import './Tabs.css'

function Tabs({ tabs, activeTabId, onTabChange, onTabClose, onNewTab, onCloseAll, onReorder, onPinToggle }) {
  const [showAllTabs, setShowAllTabs] = useState(false)
  const [draggingId, setDraggingId] = useState(null)

  const handleTabClick = (tabId) => {
    onTabChange(tabId)
  }

  const handleTabClose = (e, tabId) => {
    e.stopPropagation()
    onTabClose(tabId)
  }

  const handleDragStart = (e, tabId) => {
    setDraggingId(tabId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, targetId) => {
    e.preventDefault()
    if (draggingId && targetId && draggingId !== targetId) {
      onReorder?.(draggingId, targetId)
    }
  }

  const handleDragEnd = () => {
    setDraggingId(null)
  }

  return (
    <div className="tabs-container">
      <div className="tabs-bar">
        <div className="tabs-list">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab-item ${activeTabId === tab.id ? 'active' : ''} ${tab.pinned ? 'pinned' : ''}`}
              onClick={() => handleTabClick(tab.id)}
              draggable
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragOver={(e) => handleDragOver(e, tab.id)}
              onDragEnd={handleDragEnd}
            >
              {tab.pinned && <span className="tab-pin">📌</span>}
              <span className="tab-title">{tab.title}</span>
              {onPinToggle && (
                <button
                  className="tab-pin-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPinToggle(tab.id)
                  }}
                  title={tab.pinned ? 'Открепить' : 'Закрепить'}
                >
                  📌
                </button>
              )}
              {tabs.length > 1 && (
                <button
                  className="tab-close"
                  onClick={(e) => handleTabClose(e, tab.id)}
                  aria-label="Закрыть вкладку"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="tabs-actions">
          <button
            className="tabs-action-button"
            onClick={onCloseAll}
            title="Закрыть все вкладки"
          >
            ✕✕
          </button>
          <button
            className="tabs-action-button"
            onClick={() => setShowAllTabs(!showAllTabs)}
            title="Показать все вкладки"
          >
            ☰
          </button>
        </div>
      </div>
      <div 
        className={`tabs-overview-overlay ${showAllTabs ? 'show' : ''}`}
        onClick={() => setShowAllTabs(false)}
      />
      <div className={`tabs-overview ${showAllTabs ? 'show' : ''}`}>
        <div className="tabs-overview-header">
          <h3>Все вкладки ({tabs.length})</h3>
          <button onClick={() => setShowAllTabs(false)}>×</button>
        </div>
        <div className="tabs-overview-list">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tabs-overview-item ${activeTabId === tab.id ? 'active' : ''}`}
              onClick={() => {
                handleTabClick(tab.id)
                setShowAllTabs(false)
              }}
            >
              <div className="tabs-overview-content">
                <h4>{tab.title} {tab.pinned && '📌'}</h4>
                <p>{tab.description || 'Нет описания'}</p>
              </div>
              <div className="tabs-overview-actions">
                {onPinToggle && (
                  <button
                    className="tabs-overview-pin"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPinToggle(tab.id)
                    }}
                    title={tab.pinned ? 'Открепить' : 'Закрепить'}
                  >
                    📌
                  </button>
                )}
                <button
                  className="tabs-overview-close"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTabClose(e, tab.id)
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Tabs

