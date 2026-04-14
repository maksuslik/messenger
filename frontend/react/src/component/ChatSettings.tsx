import React, { useState } from 'react';
import { Chat } from '../types'
import { Invite } from './Invite'
import '../style/Settings.css'

interface ChatSettingsProps {
    chat: Chat,
    onSave: (chat: Partial<Chat>) => void;
    onClose: () => void;
    onDelete: () => void;
    onLeave: () => void;
    onRemoveFriend: () => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({
    chat,
    onSave,
    onClose,
    onDelete,
    onLeave,
    onRemoveFriend
}) => {
    if(!chat)
        return;

    const [showInvitePopup, setShowInvitePopup] = useState(false);
    const [formData, setFormData] = useState({
        title: chat.title
    });

    const handleSave = async () => {
        onClose();
        onSave({ id: chat.id, title: formData.title });
    }

    const createUrl = () => {
        const url = "https://msldev.ru/joinchat/" + chat.id;
        return url;
    }

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <button className="back-button" onClick={onClose}>←</button>
                    {chat.type === "GROUP" && <h2>Настройки ({chat.title})</h2>}
                    {chat.type === "DM" && <h2>Настройки ЛС</h2>}
                </div>

                <div className="settings-content">
                    {chat.role === "OWNER" && <div>
                    <div className="form-group">
                        <label>Название:</label>
                        <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    </div>
                        <div className="settings-actions">
                        <button className="btn btn-primary" onClick={handleSave}>Сохранить изменения</button>
                    </div>

                    <div className="settings-actions">
                        <button className="btn btn-primary" onClick={() => setShowInvitePopup(true)}>Создать URL для добавления в группу</button>
                    </div>

                    <Invite
                        isOpen={showInvitePopup}
                        onClose={() => setShowInvitePopup(false)}
                        inviteLink={createUrl()}
                        title="Приглашение в группу"
                    />

                    <div className="settings-danger">
                        <button className="btn btn-danger" onClick={onDelete}>Удалить чат</button>
                    </div></div>}

                    {chat.type === "DM" && <div className="settings-actions">
                        <button className="btn btn-danger" onClick={onRemoveFriend}>Удалить дружбу</button>
                    </div>}

                    {chat.type === "GROUP" && chat.role !== "OWNER" && <div className="settings-actions">
                        <button className="btn btn-danger" onClick={onLeave}>Выйти из чата</button>
                    </div>}
                </div>
            </div>
        </div>
    )
}

export default ChatSettings;