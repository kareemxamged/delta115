
interface ConfirmSubmitModalProps {
    onCancel: () => void;
    onConfirm: () => void;
    unansweredCount: number;
    timeLeft: number;
}

export default function ConfirmSubmitModal({
    onCancel,
    onConfirm,
    unansweredCount,
    timeLeft
}: ConfirmSubmitModalProps) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 110 // Higher than summary
        }}>
            <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❓</div>
                <h2 style={{ marginBottom: '1rem' }}>Are you sure you want to finish?</h2>

                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    You cannot return to the exam after submitting.
                </p>

                <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    <p>• You have <b>{Math.floor(timeLeft / 60)}</b> minutes remaining.</p>
                    <p>• You have <b>{unansweredCount}</b> unanswered questions.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onCancel}
                        className="btn-secondary"
                        style={{ flex: 1 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn-primary"
                        style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444' }}
                    >
                        Yes, Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
