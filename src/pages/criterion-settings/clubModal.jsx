import React from 'react'
import ModalCom from '../../components/modal'
import { ModalBody, ModalFooter, Button, Input, Label, FormGroup } from 'reactstrap'

function ClubModal({ showClubModal, setShowClubModal, clubs = [], selectedClubs, handleChangeClub }) {
    return (
        <ModalCom open={showClubModal} title={'Select Clubs'} toggle={() => setShowClubModal(false)}>
            <ModalBody>
                <div className='crt-club'>
                    {
                        clubs.map((val, k) => {
                            return (
                                <FormGroup key={k}>
                                    <Input
                                        type='checkbox'
                                        checked={selectedClubs.includes(val.id)}
                                        onChange={() => handleChangeClub(val.id)}
                                    />
                                    {'  '}
                                    <Label className=''>{val.name}</Label>
                                </FormGroup>
                            )
                        })
                    }
                </div>

            </ModalBody>
            <ModalFooter>
                <Button size='sm' onClick={() => setShowClubModal(false)}>Done</Button>
            </ModalFooter>
        </ModalCom>
    )
}

export default ClubModal